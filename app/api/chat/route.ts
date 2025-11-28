import { streamText } from 'ai';
import { PROJECT_PLANNING_SYSTEM_PROMPT, ALMURSHID_ASSISTANT_PROMPT } from '@/lib/ai/prompts';
import { getAIModel } from '@/lib/ai/config';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * POST /api/chat
 * 
 * Conversational endpoint for both project planning and project management.
 * - For initial planning (generate page): Uses PROJECT_PLANNING_SYSTEM_PROMPT
 * - For project management (ai page): Uses ALMURSHID_ASSISTANT_PROMPT with project context
 * 
 * Request body:
 * {
 *   messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>,
 *   projectId?: number,
 *   context?: { tasks: any[], memories: any[] }
 * }
 * 
 * Returns: Streaming text response from configured AI model
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, projectId, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { status: 400 });
    }

    // Determine which system prompt to use
    let systemPrompt = PROJECT_PLANNING_SYSTEM_PROMPT;
    let enhancedMessages = messages;

    // If projectId and context are provided, use المرشد assistant prompt
    if (projectId && context) {
      systemPrompt = ALMURSHID_ASSISTANT_PROMPT;
      
      // Build comprehensive context info
      const { project, tasks, phases, dependencies, memories } = context;
      
      // Group tasks by phase
      const tasksByPhase: Record<number, any[]> = {};
      const tasksWithoutPhase: any[] = [];
      
      tasks?.forEach((task: any) => {
        if (task.phase_id) {
          if (!tasksByPhase[task.phase_id]) {
            tasksByPhase[task.phase_id] = [];
          }
          tasksByPhase[task.phase_id].push(task);
        } else {
          tasksWithoutPhase.push(task);
        }
      });

      // Build phase info
      let phasesInfo = '';
      phases?.forEach((phase: any) => {
        const phaseTasks = tasksByPhase[phase.id] || [];
        const completedCount = phaseTasks.filter((t: any) => t.status === 'completed').length;
        const totalXP = phaseTasks.reduce((sum: number, t: any) => sum + (t.xp || 0), 0);
        
        phasesInfo += `\n📍 **${phase.name}** (ترتيب: ${phase.order_index})\n`;
        phasesInfo += `   ${phase.description}\n`;
        phasesInfo += `   المهام: ${phaseTasks.length} (مكتمل: ${completedCount}، XP: ${totalXP})\n`;
        
        if (phaseTasks.length > 0) {
          phaseTasks.slice(0, 3).forEach((t: any) => {
            phasesInfo += `   - ${t.name} [${t.difficulty}] - ${t.status} (${t.xp} XP)\n`;
          });
          if (phaseTasks.length > 3) {
            phasesInfo += `   ... و ${phaseTasks.length - 3} مهمة أخرى\n`;
          }
        }
      });

      // Build dependencies info
      const dependenciesInfo = dependencies && dependencies.length > 0
        ? `\n🔗 **التبعيات**: ${dependencies.length} علاقة تبعية بين المهام\n`
        : '';

      // Build constants info
      const constants = memories?.filter((m: any) => m.type === 'constants') || [];
      const constantsInfo = constants.length > 0
        ? `\n🔧 **الثوابت والأدوات** (${constants.length}):\n${constants.slice(0, 5).map((m: any) => 
            `- ${m.label}: ${m.content}`
          ).join('\n')}\n${constants.length > 5 ? `... و ${constants.length - 5} أخرى\n` : ''}`
        : '';

      // Build fragments info
      const fragments = memories?.filter((m: any) => m.type === 'fragments') || [];
      const fragmentsInfo = fragments.length > 0
        ? `\n💡 **الشذرات والأفكار** (${fragments.length}):\n${fragments.slice(0, 3).map((m: any) => 
            `- ${m.label}`
          ).join('\n')}\n${fragments.length > 3 ? `... و ${fragments.length - 3} أخرى\n` : ''}`
        : '';

      // Build task summary
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter((t: any) => t.status === 'completed').length || 0;
      const inProgressTasks = tasks?.filter((t: any) => t.status === 'in_progress').length || 0;
      const blockedTasks = tasks?.filter((t: any) => t.status === 'blocked').length || 0;
      const totalXP = tasks?.reduce((sum: number, t: any) => sum + (t.xp || 0), 0) || 0;
      const earnedXP = tasks?.filter((t: any) => t.status === 'completed')
        .reduce((sum: number, t: any) => sum + (t.xp || 0), 0) || 0;

      const contextInfo = `
معلومات المشروع الحالية:

📁 **المشروع**: ${project?.name || 'غير محدد'}
📝 **الوصف**: ${project?.description || 'لا يوجد وصف'}
${project?.breif ? `📄 **الملخص**: متوفر (${project.breif.length} حرف)\n` : ''}
${project?.prompt ? `🤖 **موجه AI**: متوفر\n` : ''}

📊 **إحصائيات المهام**:
- الإجمالي: ${totalTasks} مهمة
- مكتمل: ${completedTasks} ✅
- قيد التنفيذ: ${inProgressTasks} ⏳
- محظور: ${blockedTasks} 🔒
- XP المكتسب: ${earnedXP} / ${totalXP}

🎯 **المراحل** (${phases?.length || 0} مرحلة):${phasesInfo}
${tasksWithoutPhase.length > 0 ? `\n⚠️ مهام بدون مرحلة: ${tasksWithoutPhase.length}\n` : ''}
${dependenciesInfo}${constantsInfo}${fragmentsInfo}

استخدم هذه المعلومات للإجابة على أسئلة المستخدم وتقديم اقتراحات مفيدة ومحددة.
`;

      enhancedMessages = [
        { role: 'system', content: contextInfo },
        ...messages
      ];
    }

    // Use configured AI model for cost-effective conversational planning
    const result = streamText({
      model: getAIModel(),
      system: systemPrompt,
      messages: enhancedMessages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
