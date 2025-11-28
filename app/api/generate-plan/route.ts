import { generateText } from 'ai';
import { PLAN_GENERATION_SYSTEM_PROMPT, PLAN_GENERATION_SYSTEM_PROMPT_EN, createPlanGenerationPrompt, formatConversationHistory } from '@/lib/ai/prompts';
import { ProjectPlan } from '@/lib/types/task';
import { getAIModel } from '@/lib/ai/config';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/generate-plan
 * 
 * Generates a comprehensive project plan from conversation history.
 * Takes the chat messages and converts them into a full project structure with:
 * - Tasks with phases and predecessors
 * - Project brief and AI prompt
 * - System constants and fragments
 * 
 * Saves everything to the database and marks the project as generated.
 * 
 * Request body:
 * {
 *   messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>,
 *   projectId: number
 * }
 * 
 * Returns: ProjectPlan object with structured tasks
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, projectId, language = 'ar' } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Invalid request: non-empty messages array required' },
        { status: 400 }
      );
    }

    if (!projectId) {
      return Response.json(
        { error: 'Invalid request: projectId is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Verify user owns the project and it hasn't been generated yet
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return Response.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      );
    }

    if (project.generate === true) {
      return Response.json(
        { error: 'Project has already been generated' },
        { status: 400 }
      );
    }

    // Step 0: Create or get chat session and save messages
    let chatSessionId: number | null = null;
    
    try {
      // Get or create chat session
      const { data: existingSession } = await supabase
        .from('chat_session')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        chatSessionId = existingSession.id;
      } else {
        const { data: newSession, error: sessionError } = await supabase
          .from('chat_session')
          .insert([{
            user_id: user.id,
            project_id: projectId,
            title: `${project.name || 'Project'} - Planning Session`,
          }])
          .select('id')
          .single();

        if (sessionError) {
          console.warn('Failed to create chat session:', sessionError);
        } else {
          chatSessionId = newSession.id;
        }
      }

      // Save all messages to the database if we have a session
      if (chatSessionId) {
        const messagesToInsert = messages
          .filter((m: any) => m.role !== 'system') // Don't save system messages
          .map((m: any) => ({
            session_id: chatSessionId,
            role: m.role,
            content: m.content,
          }));

        if (messagesToInsert.length > 0) {
          const { error: messagesError } = await supabase
            .from('messages')
            .insert(messagesToInsert);

          if (messagesError) {
            console.warn('Failed to save messages:', messagesError);
          }
        }
      }
    } catch (sessionErr) {
      console.warn('Error handling chat session:', sessionErr);
    }

    // Format conversation history for the AI
    const conversationHistory = formatConversationHistory(messages);
    const userPrompt = createPlanGenerationPrompt(conversationHistory, language as 'ar' | 'en');

    // Use configured AI model for plan generation with language-specific prompt
    const systemPrompt = language === 'en' ? PLAN_GENERATION_SYSTEM_PROMPT_EN : PLAN_GENERATION_SYSTEM_PROMPT;
    const result = await generateText({
      model: getAIModel(),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 8000, // Allow for comprehensive plan generation
    });

    // Parse the AI response as JSON
    interface AIGeneratedPlan {
      projectName: string;
      projectDescription: string;
      projectBrief: string;
      aiPrompt: string;
      phases: Array<{
        id: string;
        name: string;
        description: string;
        order: number;
      }>;
      tasks: Array<{
        id: string;
        name: string;
        description: string;
        xp: number;
        difficulty: string;
        hints: string[];
        tools: string[];
        timeEstimate: number;
        phaseId?: string;
        predecessors?: string[];
      }>;
      constants: Array<{
        id: string;
        label: string;
        description: string;
        category: string;
      }>;
      fragments: Array<{
        id: string;
        title: string;
        content: string;
      }>;
    }
    
    let planData: AIGeneratedPlan;
    
    try {
      // Extract JSON from response (handle markdown code blocks if present)
      const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/) || result.text.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : result.text;
      
      planData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', result.text);
      throw new Error('AI generated invalid JSON format');
    }

    // Validate required fields
    if (!planData.projectName || !planData.tasks || !Array.isArray(planData.tasks)) {
      throw new Error('AI response missing required fields');
    }

    // Update project with brief, prompt, and mark as generated
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        name: planData.projectName,
        description: planData.projectDescription,
        breif: planData.projectBrief,
        prompt: planData.aiPrompt,
        generate: true,
      })
      .eq('id', projectId);

    if (updateError) {
      throw new Error(`Failed to update project: ${updateError.message}`);
    }

    // Step 1: Insert phases into phases table
    const phaseIdMap: Record<string, number> = {}; // AI ID -> DB ID mapping
    let insertedPhases: any[] = [];
    
    if (planData.phases && planData.phases.length > 0) {
      const phasesToInsert = planData.phases.map(phase => ({
        project_id: projectId,
        name: phase.name,
        description: phase.description,
        order_index: phase.order,
      }));

      const { data: phasesData, error: phasesError } = await supabase
        .from('phases')
        .insert(phasesToInsert)
        .select();

      if (phasesError) {
        throw new Error(`Failed to insert phases: ${phasesError.message}`);
      }

      insertedPhases = phasesData || [];

      // Create mapping from AI-generated ID to database ID
      insertedPhases.forEach((dbPhase, index) => {
        const aiPhase = planData.phases[index];
        phaseIdMap[aiPhase.id] = dbPhase.id;
      });
    }

    // Step 2: Insert tasks into tasks table
    const taskIdMap: Record<string, number> = {}; // AI ID -> DB ID mapping
    
    const tasksToInsert = planData.tasks.map(task => ({
      project_id: projectId,
      name: task.name,
      description: task.description,
      xp: task.xp,
      difficulty: task.difficulty,
      time_estimate: task.timeEstimate,
      tools: JSON.stringify(task.tools),
      hints: JSON.stringify(task.hints),
      status: 'not started',
      phase_id: task.phaseId ? phaseIdMap[task.phaseId] : null,
    }));

    const { data: insertedTasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (tasksError) {
      throw new Error(`Failed to insert tasks: ${tasksError.message}`);
    }

    // Create mapping from AI-generated ID to database ID
    insertedTasks.forEach((dbTask, index) => {
      const aiTask = planData.tasks[index];
      taskIdMap[aiTask.id] = dbTask.id;
    });

    // Step 3: Insert task dependencies
    const dependenciesToInsert: Array<{
      task_id: number;
      predecessor_task_id: number;
    }> = [];

    planData.tasks.forEach((task) => {
      if (task.predecessors && task.predecessors.length > 0) {
        task.predecessors.forEach((predecessorId) => {
          if (taskIdMap[task.id] && taskIdMap[predecessorId]) {
            dependenciesToInsert.push({
              task_id: taskIdMap[task.id],
              predecessor_task_id: taskIdMap[predecessorId],
            });
          }
        });
      }
    });

    if (dependenciesToInsert.length > 0) {
      const { error: depsError } = await supabase
        .from('task_dependencies')
        .insert(dependenciesToInsert);

      if (depsError) {
        console.warn('Failed to insert dependencies:', depsError);
      }
    }

    // Step 4: Insert constants as memory items (with reversed content and description)
    if (planData.constants && planData.constants.length > 0) {
      const constantsToInsert = planData.constants.map(constant => ({
        project_id: projectId,
        type: 'constants',
        label: constant.category, // Label is the category (tool, feature, etc.)
        content: constant.label, // Reversed: original label in content
        description: constant.description, // Reversed: description in description field
        meta_data: { category: constant.category },
      }));

      const { error: constantsError } = await supabase
        .from('memory')
        .insert(constantsToInsert);

      if (constantsError) {
        console.warn('Failed to insert constants:', constantsError);
      }
    }

    // Step 5: Insert fragments as memory items
    if (planData.fragments && planData.fragments.length > 0) {
      const fragmentsToInsert = planData.fragments.map(fragment => ({
        project_id: projectId,
        type: 'fragments',
        label: fragment.title,
        content: fragment.content,
        description: 'Brainstorming idea',
        meta_data: {},
      }));

      const { error: fragmentsError } = await supabase
        .from('memory')
        .insert(fragmentsToInsert);

      if (fragmentsError) {
        console.warn('Failed to insert fragments:', fragmentsError);
      }
    }

    // Calculate totals
    const totalXP = planData.tasks.reduce((sum, task) => sum + task.xp, 0);
    const totalTime = planData.tasks.reduce((sum, task) => sum + task.timeEstimate, 0);

    const projectPlan: ProjectPlan = {
      projectName: planData.projectName,
      projectDescription: planData.projectDescription,
      projectBrief: planData.projectBrief,
      aiPrompt: planData.aiPrompt,
      tasks: insertedTasks,
      phases: insertedPhases || [],
      constants: [],
      fragments: [],
      totalXP,
      totalTime,
    };

    return Response.json({ success: true, plan: projectPlan }, { status: 200 });

  } catch (error) {
    console.error('Generate plan API error:', error);
    return Response.json(
      { 
        error: 'Failed to generate project plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
