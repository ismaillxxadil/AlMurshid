'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Circle, Clock, Lock, AlertCircle } from 'lucide-react';

interface Task {
  id: number;
  name: string;
  description: string;
  xp: number;
  difficulty: string;
  status: string;
  tools: string;
  hints: string;
  time_estimate: number;
  phase_id: number | null;
}

interface Phase {
  id: number;
  name: string;
  description: string;
  order_index: number;
}

interface Dependency {
  id: number;
  task_id: number;
  predecessor_task_id: number;
}

const difficultyColors = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-orange-500',
  expert: 'bg-red-500',
};

const difficultyLabels = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
  expert: 'خبير',
};

const statusIcons = {
  not_started: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
  blocked: Lock,
};

const statusLabels = {
  not_started: 'لم يبدأ',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  blocked: 'محظور',
};

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<number | 'all' | 'unassigned'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksRes, phasesRes, depsRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/tasks`),
          fetch(`/api/projects/${projectId}/phases`),
          fetch(`/api/projects/${projectId}/dependencies`),
        ]);

        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (phasesRes.ok) setPhases(await phasesRes.json());
        if (depsRes.ok) setDependencies(await depsRes.json());
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  // Get predecessors for a task
  const getPredecessors = (taskId: number): number[] => {
    return dependencies
      .filter(dep => dep.task_id === taskId)
      .map(dep => dep.predecessor_task_id);
  };

  // Check if task is blocked by incomplete predecessors
  const isTaskBlocked = (task: Task): boolean => {
    const predecessorIds = getPredecessors(task.id);
    if (predecessorIds.length === 0) return false;
    
    return predecessorIds.some(predId => {
      const predTask = tasks.find(t => t.id === predId);
      return predTask && predTask.status !== 'completed';
    });
  };

  // Group tasks by phase
  const tasksByPhase: Record<number, Task[]> = {};
  const unassignedTasks: Task[] = [];

  tasks.forEach(task => {
    if (task.phase_id) {
      if (!tasksByPhase[task.phase_id]) {
        tasksByPhase[task.phase_id] = [];
      }
      tasksByPhase[task.phase_id].push(task);
    } else {
      unassignedTasks.push(task);
    }
  });

  // Calculate phase progress
  const getPhaseProgress = (phaseId: number) => {
    const phaseTasks = tasksByPhase[phaseId] || [];
    const completed = phaseTasks.filter(t => t.status === 'completed').length;
    const total = phaseTasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const totalXP = phaseTasks.reduce((sum, t) => sum + t.xp, 0);
    const earnedXP = phaseTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.xp, 0);
    
    return { completed, total, percentage, totalXP, earnedXP };
  };

  // Filter tasks based on selected phase
  const getFilteredTasks = () => {
    if (selectedPhase === 'all') {
      return tasks;
    } else if (selectedPhase === 'unassigned') {
      return unassignedTasks;
    } else {
      return tasksByPhase[selectedPhase] || [];
    }
  };

  const filteredTasks = getFilteredTasks();

  const TaskCard = ({ task }: { task: Task }) => {
    const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
    const blocked = isTaskBlocked(task);
    const predecessorIds = getPredecessors(task.id);
    const predecessorTasks = predecessorIds.map(id => tasks.find(t => t.id === id)).filter(Boolean);
    
    let tools: string[] = [];
    let hints: string[] = [];
    
    try {
      tools = task.tools ? JSON.parse(task.tools) : [];
      hints = task.hints ? JSON.parse(task.hints) : [];
    } catch (e) {
      // Handle parsing errors
    }

    return (
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-accent)] transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${task.status === 'completed' ? 'text-green-500' : 'text-[var(--color-ink-soft)]'}`} />
            <h3 className="font-semibold text-[var(--color-ink)]">{task.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 ${difficultyColors[task.difficulty as keyof typeof difficultyColors]} text-white`}>
              {difficultyLabels[task.difficulty as keyof typeof difficultyLabels]}
            </span>
            <span className="text-xs px-2 py-1 bg-[var(--color-accent)] text-[var(--color-ink)] font-mono">
              {task.xp} XP
            </span>
          </div>
        </div>

        <p className="text-sm text-[var(--color-ink-soft)] mb-3">{task.description}</p>

        <div className="flex items-center gap-4 text-xs text-[var(--color-ink-soft)] mb-3">
          <span>⏱️ {task.time_estimate} ساعة</span>
          <span>📊 {statusLabels[task.status as keyof typeof statusLabels]}</span>
        </div>

        {blocked && (
          <div className="flex items-center gap-2 text-xs text-orange-500 mb-2 bg-orange-50 dark:bg-orange-950 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span>محظور: يحتاج إكمال {predecessorTasks.length} مهمة أولاً</span>
          </div>
        )}

        {predecessorIds.length > 0 && (
          <div className="mb-2">
            <div className="text-xs text-[var(--color-ink-soft)] mb-1">🔗 يعتمد على:</div>
            <div className="flex flex-wrap gap-1">
              {predecessorTasks.map((predTask: any) => (
                <span 
                  key={predTask.id} 
                  className={`text-xs px-2 py-1 ${predTask.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'}`}
                >
                  {predTask.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {tools.length > 0 && (
          <div className="mb-2">
            <div className="text-xs text-[var(--color-ink-soft)] mb-1">🔧 الأدوات:</div>
            <div className="flex flex-wrap gap-1">
              {tools.map((tool: string, idx: number) => (
                <span key={idx} className="text-xs px-2 py-1 bg-[var(--color-bg)] text-[var(--color-ink)]">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {hints.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
              💡 نصائح ({hints.length})
            </summary>
            <ul className="mt-2 space-y-1 pr-4">
              {hints.map((hint: string, idx: number) => (
                <li key={idx} className="text-[var(--color-ink-soft)]">• {hint}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[var(--color-ink-soft)]">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--color-ink-soft)]">المهام</div>
          <div className="text-2xl font-semibold">لوحة المهام</div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 bg-[var(--color-surface)]">{tasks.length} مهمة</span>
          <span className="px-2 py-1 bg-[var(--color-surface)]">{phases.length} مرحلة</span>
          <span className="px-2 py-1 bg-green-500 text-white">
            {tasks.filter(t => t.status === 'completed').length} مكتمل
          </span>
        </div>
      </div>

      {/* Phase Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedPhase('all')}
          className={`px-4 py-2 text-sm font-mono whitespace-nowrap transition-colors ${
            selectedPhase === 'all'
              ? 'bg-[var(--color-accent)] text-[var(--color-ink)]'
              : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-accent)]'
          }`}
        >
          الكل ({tasks.length})
        </button>
        
        {phases.map(phase => {
          const progress = getPhaseProgress(phase.id);
          return (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`px-4 py-2 text-sm font-mono whitespace-nowrap transition-colors ${
                selectedPhase === phase.id
                  ? 'bg-[var(--color-accent)] text-[var(--color-ink)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-accent)]'
              }`}
            >
              {phase.name} ({progress.completed}/{progress.total})
            </button>
          );
        })}

        {unassignedTasks.length > 0 && (
          <button
            onClick={() => setSelectedPhase('unassigned')}
            className={`px-4 py-2 text-sm font-mono whitespace-nowrap transition-colors ${
              selectedPhase === 'unassigned'
                ? 'bg-[var(--color-accent)] text-[var(--color-ink)]'
                : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:bg-[var(--color-accent)]'
            }`}
          >
            بدون مرحلة ({unassignedTasks.length})
          </button>
        )}
      </div>

      {/* Phase Progress Bar (when viewing specific phase) */}
      {typeof selectedPhase === 'number' && (
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          {(() => {
            const phase = phases.find(p => p.id === selectedPhase);
            const progress = getPhaseProgress(selectedPhase);
            
            if (!phase) return null;
            
            return (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-[var(--color-ink)]">{phase.name}</h3>
                    <p className="text-sm text-[var(--color-ink-soft)]">{phase.description}</p>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-[var(--color-ink)]">{progress.percentage.toFixed(0)}%</div>
                    <div className="text-xs text-[var(--color-ink-soft)]">
                      {progress.earnedXP} / {progress.totalXP} XP
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-[var(--color-ink-soft)] mt-1">
                  {progress.completed} من {progress.total} مهمة مكتملة
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Tasks List */}
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-ink-soft)]">
            لا توجد مهام في هذا القسم
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}
