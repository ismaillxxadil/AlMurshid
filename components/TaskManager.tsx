'use client';

import { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Link, Unlink, 
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { 
  createTask, updateTask, deleteTask
} from '@/app/actions/tasks';
import {
  createPhase, updatePhase, deletePhase
} from '@/app/actions/phases';
import {
  addTaskDependency, removeTaskDependency
} from '@/app/actions/dependencies';

interface Task {
  id: number;
  name: string;
  description: string;
  xp: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
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

interface TaskManagerProps {
  projectId: number;
  initialTasks: Task[];
  initialPhases: Phase[];
  initialDependencies: Dependency[];
  language?: 'ar' | 'en';
  onDataChange?: () => void;
}

const difficultyColors = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-orange-500',
  expert: 'bg-red-500',
};

const difficultyLabels = {
  ar: { easy: 'سهل', medium: 'متوسط', hard: 'صعب', expert: 'خبير' },
  en: { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' }
};

const statusLabels = {
  ar: { 
    not_started: 'لم يبدأ', 
    in_progress: 'قيد التنفيذ', 
    completed: 'مكتمل', 
    blocked: 'محظور' 
  },
  en: { 
    not_started: 'Not Started', 
    in_progress: 'In Progress', 
    completed: 'Completed', 
    blocked: 'Blocked' 
  }
};

export default function TaskManager({ 
  projectId, 
  initialTasks, 
  initialPhases, 
  initialDependencies,
  language = 'ar',
  onDataChange
}: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [dependencies, setDependencies] = useState<Dependency[]>(initialDependencies);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [creatingPhase, setCreatingPhase] = useState(false);
  const [managingDependencies, setManagingDependencies] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const t = language === 'ar' ? {
    tasks: 'المهام',
    phases: 'المراحل',
    addTask: '+ إضافة مهمة',
    addPhase: '+ إضافة مرحلة',
    editTask: 'تعديل المهمة',
    createTask: 'إنشاء مهمة جديدة',
    editPhase: 'تعديل المرحلة',
    createPhase: 'إنشاء مرحلة جديدة',
    manageDeps: 'إدارة التبعيات',
    name: 'الاسم',
    description: 'الوصف',
    xp: 'نقاط الخبرة',
    difficulty: 'الصعوبة',
    status: 'الحالة',
    timeEstimate: 'التقدير الزمني (ساعات)',
    phase: 'المرحلة',
    tools: 'الأدوات (JSON)',
    hints: 'التلميحات (JSON)',
    order: 'الترتيب',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    dependencies: 'التبعيات',
    predecessors: 'المهام السابقة',
    addDependency: 'إضافة تبعية',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    noPhase: 'بدون مرحلة',
    loading: 'جاري التحميل...',
  } : {
    tasks: 'Tasks',
    phases: 'Phases',
    addTask: '+ Add Task',
    addPhase: '+ Add Phase',
    editTask: 'Edit Task',
    createTask: 'Create New Task',
    editPhase: 'Edit Phase',
    createPhase: 'Create New Phase',
    manageDeps: 'Manage Dependencies',
    name: 'Name',
    description: 'Description',
    xp: 'Experience Points',
    difficulty: 'Difficulty',
    status: 'Status',
    timeEstimate: 'Time Estimate (hours)',
    phase: 'Phase',
    tools: 'Tools (JSON)',
    hints: 'Hints (JSON)',
    order: 'Order',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    dependencies: 'Dependencies',
    predecessors: 'Predecessors',
    addDependency: 'Add Dependency',
    confirmDelete: 'Are you sure you want to delete?',
    noPhase: 'No Phase',
    loading: 'Loading...',
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  // Task CRUD Operations
  const handleCreateTask = async (taskData: Partial<Task>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createTask(projectId, {
        name: taskData.name!,
        description: taskData.description!,
        xp: taskData.xp!,
        difficulty: taskData.difficulty!,
        time_estimate: taskData.time_estimate!,
        tools: taskData.tools,
        hints: taskData.hints,
        status: taskData.status || 'not_started',
        phase_id: taskData.phase_id,
      });

      if (result.error) {
        showError(result.error);
      } else if (result.task) {
        setTasks([...tasks, result.task]);
        setCreatingTask(false);
        showSuccess(language === 'ar' ? 'تم إنشاء المهمة بنجاح' : 'Task created successfully');
        onDataChange?.();
      }
    } catch (err) {
      showError(language === 'ar' ? 'فشل في إنشاء المهمة' : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateTask(taskId, projectId, updates);

      if (result.error) {
        showError(result.error);
      } else if (result.task) {
        setTasks(tasks.map(t => t.id === taskId ? result.task : t));
        setEditingTask(null);
        showSuccess(language === 'ar' ? 'تم تحديث المهمة بنجاح' : 'Task updated successfully');
        onDataChange?.();
      }
    } catch (err) {
      showError(language === 'ar' ? 'فشل في تحديث المهمة' : 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm(t.confirmDelete)) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await deleteTask(taskId, projectId);

      if (result.error) {
        showError(result.error);
      } else {
        setTasks(tasks.filter(t => t.id !== taskId));
        setDependencies(dependencies.filter(d => d.task_id !== taskId && d.predecessor_task_id !== taskId));
        showSuccess(language === 'ar' ? 'تم حذف المهمة بنجاح' : 'Task deleted successfully');
        onDataChange?.();
      }
    } catch (err) {
      showError(language === 'ar' ? 'فشل في حذف المهمة' : 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  // Phase CRUD Operations
  const handleCreatePhase = async (phaseData: Partial<Phase>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createPhase(projectId, {
        name: phaseData.name!,
        description: phaseData.description!,
        order_index: phaseData.order_index!,
      });

      if (result.error) {
        showError(result.error);
      } else if (result.phase) {
        setPhases([...phases, result.phase]);
        setCreatingPhase(false);
        showSuccess(language === 'ar' ? 'تم إنشاء المرحلة بنجاح' : 'Phase created successfully');
        onDataChange?.();
      }
    } catch (err) {
      showError(language === 'ar' ? 'فشل في إنشاء المرحلة' : 'Failed to create phase');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhase = async (phaseId: number, updates: Partial<Phase>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updatePhase(phaseId, projectId, updates);

      if (result.error) {
        showError(result.error);
      } else if (result.phase) {
        setPhases(phases.map(p => p.id === phaseId ? result.phase : p));
        setEditingPhase(null);
        showSuccess(language === 'ar' ? 'تم تحديث المرحلة بنجاح' : 'Phase updated successfully');
        onDataChange?.();
      }
    } catch (err) {
      showError(language === 'ar' ? 'فشل في تحديث المرحلة' : 'Failed to update phase');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
    if (!confirm(t.confirmDelete)) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await deletePhase(phaseId, projectId);

      if (result.error) {
        showError(result.error);
      } else {
        setPhases(phases.filter(p => p.id !== phaseId));
        // Update tasks in this phase to have no phase
        setTasks(tasks.map(t => t.phase_id === phaseId ? { ...t, phase_id: null } : t));
        showSuccess(language === 'ar' ? 'تم حذف المرحلة بنجاح' : 'Phase deleted successfully');
        onDataChange?.();
      }
    } catch (err) {
      showError(language === 'ar' ? 'فشل في حذف المرحلة' : 'Failed to delete phase');
    } finally {
      setLoading(false);
    }
  };

  // Dependency Operations
  const handleAddDependency = async (taskId: number, predecessorId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await addTaskDependency(taskId, predecessorId, projectId);

      if (result.error) {
        showError(result.error);
      } else if (result.dependency) {
        setDependencies([...dependencies, result.dependency]);
        showSuccess(language === 'ar' ? 'تم إضافة التبعية بنجاح' : 'Dependency added successfully');
        onDataChange?.();
      }
    } catch (err) {
      showError(language === 'ar' ? 'فشل في إضافة التبعية' : 'Failed to add dependency');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDependency = async (dependencyId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await removeTaskDependency(dependencyId, projectId);

      if (result.error) {
        showError(result.error);
      } else {
        setDependencies(dependencies.filter(d => d.id !== dependencyId));
        showSuccess(language === 'ar' ? 'تم إزالة التبعية بنجاح' : 'Dependency removed successfully');
        onDataChange?.();
      }
    } catch (err) {
      showError(language === 'ar' ? 'فشل في إزالة التبعية' : 'Failed to remove dependency');
    } finally {
      setLoading(false);
    }
  };

  const getPredecessors = (taskId: number) => {
    return dependencies
      .filter(d => d.task_id === taskId)
      .map(d => tasks.find(t => t.id === d.predecessor_task_id))
      .filter(Boolean);
  };

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 text-green-600">
          <CheckCircle2 className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Phases Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.phases}</h3>
          <button
            onClick={() => setCreatingPhase(true)}
            className="px-3 py-1 text-sm bg-[var(--color-accent)] text-[var(--color-ink)] hover:bg-[var(--color-accent-strong)] transition-colors"
          >
            {t.addPhase}
          </button>
        </div>

        {creatingPhase && (
          <PhaseForm
            phase={null}
            language={language}
            labels={t}
            onSave={handleCreatePhase}
            onCancel={() => setCreatingPhase(false)}
            loading={loading}
          />
        )}

        <div className="grid gap-2">
          {phases.sort((a, b) => a.order_index - b.order_index).map(phase => (
            <div key={phase.id}>
              {editingPhase?.id === phase.id ? (
                <PhaseForm
                  phase={phase}
                  language={language}
                  labels={t}
                  onSave={(updates) => handleUpdatePhase(phase.id, updates)}
                  onCancel={() => setEditingPhase(null)}
                  loading={loading}
                />
              ) : (
                <div className="flex items-center justify-between p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
                  <div>
                    <div className="font-semibold">{phase.order_index}. {phase.name}</div>
                    <div className="text-sm text-[var(--color-ink-soft)]">{phase.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPhase(phase)}
                      className="p-2 hover:bg-[var(--color-bg)] transition-colors"
                      title={t.edit}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePhase(phase.id)}
                      className="p-2 hover:bg-red-500/10 text-red-500 transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.tasks}</h3>
          <button
            onClick={() => setCreatingTask(true)}
            className="px-3 py-1 text-sm bg-[var(--color-accent)] text-[var(--color-ink)] hover:bg-[var(--color-accent-strong)] transition-colors"
          >
            {t.addTask}
          </button>
        </div>

        {creatingTask && (
          <TaskForm
            task={null}
            phases={phases}
            language={language}
            labels={t}
            onSave={handleCreateTask}
            onCancel={() => setCreatingTask(false)}
            loading={loading}
          />
        )}

        <div className="grid gap-3">
          {tasks.map(task => (
            <div key={task.id}>
              {editingTask?.id === task.id ? (
                <TaskForm
                  task={task}
                  phases={phases}
                  language={language}
                  labels={t}
                  onSave={(updates) => handleUpdateTask(task.id, updates)}
                  onCancel={() => setEditingTask(null)}
                  loading={loading}
                />
              ) : (
                <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--color-ink)]">{task.name}</h4>
                      <p className="text-sm text-[var(--color-ink-soft)] mt-1">{task.description}</p>
                    </div>
                    <div className="flex gap-1 ml-3">
                      <button
                        onClick={() => setManagingDependencies(managingDependencies === task.id ? null : task.id)}
                        className="p-2 hover:bg-[var(--color-bg)] transition-colors"
                        title={t.manageDeps}
                      >
                        <Link className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-2 hover:bg-[var(--color-bg)] transition-colors"
                        title={t.edit}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 transition-colors"
                        title={t.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-1 ${difficultyColors[task.difficulty]} text-white`}>
                      {difficultyLabels[language][task.difficulty]}
                    </span>
                    <span className="px-2 py-1 bg-[var(--color-accent)] text-[var(--color-ink)]">
                      {task.xp} XP
                    </span>
                    <span className="px-2 py-1 bg-[var(--color-bg)] text-[var(--color-ink-soft)]">
                      {statusLabels[language][task.status]}
                    </span>
                    <span className="px-2 py-1 bg-[var(--color-bg)] text-[var(--color-ink-soft)]">
                      ⏱️ {task.time_estimate}h
                    </span>
                    {task.phase_id && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-600">
                        {phases.find(p => p.id === task.phase_id)?.name || t.noPhase}
                      </span>
                    )}
                  </div>

                  {managingDependencies === task.id && (
                    <DependencyManager
                      task={task}
                      allTasks={tasks}
                      dependencies={dependencies}
                      language={language}
                      labels={t}
                      onAdd={handleAddDependency}
                      onRemove={handleRemoveDependency}
                    />
                  )}

                  {getPredecessors(task.id).length > 0 && managingDependencies !== task.id && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                      <div className="text-xs text-[var(--color-ink-soft)] mb-1">{t.predecessors}:</div>
                      <div className="flex flex-wrap gap-1">
                        {getPredecessors(task.id).map((pred: any) => (
                          <span key={pred.id} className="text-xs px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            {pred.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Task Form Component
function TaskForm({ 
  task, 
  phases, 
  language, 
  labels, 
  onSave, 
  onCancel, 
  loading 
}: {
  task: Task | null;
  phases: Phase[];
  language: 'ar' | 'en';
  labels: any;
  onSave: (data: Partial<Task>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Task>>(task || {
    name: '',
    description: '',
    xp: 50,
    difficulty: 'medium',
    status: 'not_started',
    time_estimate: 2,
    tools: '[]',
    hints: '[]',
    phase_id: null,
  });

  return (
    <div className="border-2 border-[var(--color-accent)] bg-[var(--color-surface)] p-4 space-y-3">
      <h4 className="font-semibold">{task ? labels.editTask : labels.createTask}</h4>
      
      <input
        type="text"
        placeholder={labels.name}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
      />
      
      <textarea
        placeholder={labels.description}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
        rows={3}
      />
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--color-ink-soft)]">{labels.xp}</label>
          <input
            type="number"
            value={formData.xp}
            onChange={(e) => setFormData({ ...formData, xp: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
          />
        </div>
        
        <div>
          <label className="text-xs text-[var(--color-ink-soft)]">{labels.timeEstimate}</label>
          <input
            type="number"
            step="0.5"
            value={formData.time_estimate}
            onChange={(e) => setFormData({ ...formData, time_estimate: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-[var(--color-ink-soft)]">{labels.difficulty}</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
          >
            {Object.entries(difficultyLabels[language]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-xs text-[var(--color-ink-soft)]">{labels.status}</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
          >
            {Object.entries(statusLabels[language]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-xs text-[var(--color-ink-soft)]">{labels.phase}</label>
          <select
            value={formData.phase_id || ''}
            onChange={(e) => setFormData({ ...formData, phase_id: e.target.value ? parseInt(e.target.value) : null })}
            className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
          >
            <option value="">{labels.noPhase}</option>
            {phases.map(phase => (
              <option key={phase.id} value={phase.id}>{phase.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <input
        type="text"
        placeholder={labels.tools}
        value={formData.tools}
        onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)] font-mono text-xs"
      />
      
      <input
        type="text"
        placeholder={labels.hints}
        value={formData.hints}
        onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)] font-mono text-xs"
      />
      
      <div className="flex gap-2">
        <button
          onClick={() => onSave(formData)}
          disabled={loading || !formData.name || !formData.description}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {labels.save}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}

// Phase Form Component
function PhaseForm({ 
  phase, 
  language, 
  labels, 
  onSave, 
  onCancel, 
  loading 
}: {
  phase: Phase | null;
  language: 'ar' | 'en';
  labels: any;
  onSave: (data: Partial<Phase>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Phase>>(phase || {
    name: '',
    description: '',
    order_index: 1,
  });

  return (
    <div className="border-2 border-[var(--color-accent)] bg-[var(--color-surface)] p-4 space-y-3">
      <h4 className="font-semibold">{phase ? labels.editPhase : labels.createPhase}</h4>
      
      <input
        type="text"
        placeholder={labels.name}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
      />
      
      <textarea
        placeholder={labels.description}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
        rows={2}
      />
      
      <div>
        <label className="text-xs text-[var(--color-ink-soft)]">{labels.order}</label>
        <input
          type="number"
          value={formData.order_index}
          onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
          className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onSave(formData)}
          disabled={loading || !formData.name || !formData.description}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {labels.save}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}

// Dependency Manager Component
function DependencyManager({
  task,
  allTasks,
  dependencies,
  language,
  labels,
  onAdd,
  onRemove
}: {
  task: Task;
  allTasks: Task[];
  dependencies: Dependency[];
  language: 'ar' | 'en';
  labels: any;
  onAdd: (taskId: number, predecessorId: number) => void;
  onRemove: (dependencyId: number) => void;
}) {
  const [selectedPredecessor, setSelectedPredecessor] = useState<number | null>(null);
  
  const currentDeps = dependencies.filter(d => d.task_id === task.id);
  const availableTasks = allTasks.filter(t => 
    t.id !== task.id && 
    !currentDeps.some(d => d.predecessor_task_id === t.id)
  );

  return (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-2">
      <h5 className="text-sm font-semibold">{labels.dependencies}</h5>
      
      {currentDeps.length > 0 && (
        <div className="space-y-1">
          {currentDeps.map(dep => {
            const predTask = allTasks.find(t => t.id === dep.predecessor_task_id);
            return (
              <div key={dep.id} className="flex items-center justify-between text-sm bg-[var(--color-bg)] p-2">
                <span>{predTask?.name}</span>
                <button
                  onClick={() => onRemove(dep.id)}
                  className="p-1 hover:bg-red-500/20 text-red-500 transition-colors"
                >
                  <Unlink className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {availableTasks.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedPredecessor || ''}
            onChange={(e) => setSelectedPredecessor(e.target.value ? parseInt(e.target.value) : null)}
            className="flex-1 px-2 py-1 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)]"
          >
            <option value="">{labels.addDependency}</option>
            {availableTasks.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            onClick={() => {
              if (selectedPredecessor) {
                onAdd(task.id, selectedPredecessor);
                setSelectedPredecessor(null);
              }
            }}
            disabled={!selectedPredecessor}
            className="px-3 py-1 text-sm bg-[var(--color-accent)] text-[var(--color-ink)] hover:bg-[var(--color-accent-strong)] transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
