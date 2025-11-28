import { streamText } from 'ai';
import { getAIModel } from '@/lib/ai/config';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

/**
 * POST /api/project-ai
 * 
 * AI assistant for a specific project context.
 * Has access to the project's tasks and can help users:
 * - Understand their tasks better
 * - Get suggestions for completing tasks
 * - Modify task details (hints, tools, time estimates)
 * - Break down complex tasks
 * - Track progress and provide motivation
 * 
 * Request body:
 * {
 *   projectId: string,
 *   messages: Array<{ role: 'user' | 'assistant', content: string }>,
 *   tasks: Array<Task> // Current project tasks
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, messages, tasks } = await req.json();

    if (!projectId) {
      return Response.json(
        { error: 'Invalid request: projectId required' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    if (!tasks || !Array.isArray(tasks)) {
      return Response.json(
        { error: 'Invalid request: tasks array required' },
        { status: 400 }
      );
    }

    // Create context about the project and tasks
    const projectContext = createProjectContext(tasks);

    // System prompt for project AI assistant
    const systemPrompt = `You are an AI assistant helping a user with their project. You have access to all their tasks and can provide guidance, suggestions, and help them manage their work.

${projectContext}

Your capabilities:
1. **Answer questions** about any task (hints, tools, approach)
2. **Suggest modifications** to tasks (time estimates, difficulty, hints)
3. **Break down complex tasks** into smaller subtasks
4. **Provide encouragement** and track progress
5. **Recommend next steps** based on completed tasks
6. **Offer technical guidance** for specific tools or technologies

When suggesting task modifications, use this format:
\`\`\`json
{
  "action": "update_task",
  "taskId": "task-id-here",
  "updates": {
    "hints": ["new hint 1", "new hint 2"],
    "timeEstimate": 4,
    "difficulty": "medium"
  }
}
\`\`\`

When suggesting new subtasks:
\`\`\`json
{
  "action": "add_subtask",
  "parentTaskId": "parent-task-id",
  "subtask": {
    "name": "Subtask name",
    "description": "What to do",
    "xp": 25,
    "difficulty": "easy",
    "hints": ["hint 1"],
    "tools": ["tool1"],
    "timeEstimate": 1
  }
}
\`\`\`

Be conversational, supportive, and actionable. Focus on helping the user make progress.`;

    const result = streamText({
      model: getAIModel(),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Project AI chat error:', error);
    return Response.json(
      { 
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * Creates a context string about the project and its tasks
 */
function createProjectContext(tasks: any[]): string {
  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);
  const totalXP = tasks.reduce((sum, t) => sum + t.xp, 0);
  const earnedXP = completedTasks.reduce((sum, t) => sum + t.xp, 0);

  let context = `## Current Project Status

**Progress:** ${completedTasks.length}/${tasks.length} tasks completed (${earnedXP}/${totalXP} XP earned)

### Pending Tasks:\n`;

  pendingTasks.forEach((task, index) => {
    context += `
${index + 1}. **${task.name}** (${task.xp} XP, ${task.difficulty})
   - Description: ${task.description}
   - Time: ${task.timeEstimate}h
   - Tools: ${task.tools.join(', ')}
   - Hints: ${task.hints.join(' | ')}
`;
  });

  if (completedTasks.length > 0) {
    context += `\n### Completed Tasks:\n`;
    completedTasks.forEach((task, index) => {
      context += `${index + 1}. ${task.name} (${task.xp} XP) ✓\n`;
    });
  }

  return context;
}
