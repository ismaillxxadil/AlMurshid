import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import TaskManager from '@/components/TaskManager';



export default async function ProjectTasksPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const projectIdNum = Number(projectId);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch project to verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectIdNum)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    redirect('/dashboard');
  }

  // Fetch all data
  const [tasksResult, phasesResult, depsResult] = await Promise.all([
    supabase.from('tasks').select('*').eq('project_id', projectIdNum).order('created_at'),
    supabase.from('phases').select('*').eq('project_id', projectIdNum).order('order_index'),
    supabase.from('task_dependencies').select('*').in('task_id', 
      (await supabase.from('tasks').select('id').eq('project_id', projectIdNum)).data?.map(t => t.id) || []
    )
  ]);

  const tasks = tasksResult.data || [];
  const phases = phasesResult.data || [];
  const dependencies = depsResult.data || [];

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--color-ink-soft)]">المهام</div>
          <div className="text-2xl font-semibold">لوحة المهام التفاعلية</div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 bg-[var(--color-surface)]">{tasks.length} مهمة</span>
          <span className="px-2 py-1 bg-[var(--color-surface)]">{phases.length} مرحلة</span>
          <span className="px-2 py-1 bg-green-500 text-white">
            {tasks.filter(t => t.status === 'completed').length} مكتمل
          </span>
        </div>
      </div>

      <TaskManager
        projectId={projectIdNum}
        initialTasks={tasks}
        initialPhases={phases}
        initialDependencies={dependencies}
        language="ar"
      />
    </div>
  );
}
