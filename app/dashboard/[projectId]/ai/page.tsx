'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from 'ai/react';

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

interface Memory {
  id: number;
  type: string;
  label: string;
  content: string;
  description: string | null;
}

interface Project {
  id: number;
  name: string;
  description: string;
  breif: string;
  prompt: string;
}

export default function ProjectAiPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'system-1',
        role: 'system' as const,
        content: 'مرحباً! أنا المرشد، مساعدك الذكي في هذا المشروع. أستطيع مساعدتك في:\n\n📋 إدارة المهام (إضافة، تعديل، حذف، إعادة ترتيب)\n🎯 إدارة المراحل والتبعيات\n🔧 تحديث الأدوات والثوابت\n💡 إدارة الأفكار والشذرات\n📊 تحليل التقدم وإعطاء تقارير\n\nما الذي تحتاج مساعدة فيه اليوم؟'
      }
    ],
    body: {
      projectId,
      context: {
        project,
        tasks,
        phases,
        dependencies,
        memories
      }
    }
  });

  // Load project data
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        // Load project info
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setProject(projectData);
        }

        // Load tasks
        const tasksResponse = await fetch(`/api/projects/${projectId}/tasks`);
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData);
        }

        // Load phases
        const phasesResponse = await fetch(`/api/projects/${projectId}/phases`);
        if (phasesResponse.ok) {
          const phasesData = await phasesResponse.json();
          setPhases(phasesData);
        }

        // Load dependencies
        const depsResponse = await fetch(`/api/projects/${projectId}/dependencies`);
        if (depsResponse.ok) {
          const depsData = await depsResponse.json();
          setDependencies(depsData);
        }

        // Load memories (constants, fragments)
        const memoriesResponse = await fetch(`/api/projects/${projectId}/memories`);
        if (memoriesResponse.ok) {
          const memoriesData = await memoriesResponse.json();
          setMemories(memoriesData);
        }
      } catch (error) {
        console.error('Error loading project data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[var(--color-ink-soft)]">المرشد - المساعد الذكي</div>
          <div className="text-2xl font-semibold">إدارة المشروع والتعديلات</div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-ink-soft)]">
          <span className="px-2 py-1 bg-[var(--color-surface)]">{phases.length} مراحل</span>
          <span className="px-2 py-1 bg-[var(--color-surface)]">{tasks.length} مهمة</span>
          <span className="px-2 py-1 bg-[var(--color-surface)]">{dependencies.length} تبعية</span>
          <span className="px-2 py-1 bg-[var(--color-surface)]">{memories.length} عنصر</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => {
            const event = new Event('submit', { bubbles: true, cancelable: true });
            handleInputChange({ target: { value: 'أعطني ملخص عن حالة المشروع' } } as any);
          }}
          className="px-3 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] transition-colors"
        >
          📊 حالة المشروع
        </button>
        <button
          onClick={() => {
            handleInputChange({ target: { value: 'أظهر لي المهام المتبقية' } } as any);
          }}
          className="px-3 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] transition-colors"
        >
          ✅ المهام المتبقية
        </button>
        <button
          onClick={() => {
            handleInputChange({ target: { value: 'ما هي الأدوات والتقنيات المستخدمة؟' } } as any);
          }}
          className="px-3 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] transition-colors"
        >
          🔧 الأدوات
        </button>
        <button
          onClick={() => {
            handleInputChange({ target: { value: 'اقترح تحسينات على المشروع' } } as any);
          }}
          className="px-3 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] transition-colors"
        >
          💡 اقتراحات
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-2 py-4 space-y-4 bg-[var(--color-bg)]">
          {loading ? (
            <div className="text-center text-[var(--color-ink-soft)] py-8">
              جاري تحميل بيانات المشروع...
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <div key={m.id} className={`max-w-3xl ${m.role === 'user' ? 'ml-auto text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block px-4 py-3 ${
                      m.role === 'user'
                        ? 'bg-[var(--color-accent)] text-[var(--color-ink)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-ink)]'
                    }`}
                  >
                    <div className="text-[11px] uppercase font-mono tracking-widest text-[var(--color-ink-soft)] mb-1">
                      {m.role === 'user' ? 'أنت' : 'المرشد'}
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="max-w-3xl text-left">
                  <div className="inline-block px-4 py-3 bg-[var(--color-surface)] text-[var(--color-ink)]">
                    <div className="text-[11px] uppercase font-mono tracking-widest text-[var(--color-ink-soft)] mb-1">
                      المرشد
                    </div>
                    <div className="text-sm leading-relaxed">
                      <span className="animate-pulse">يفكر...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-[var(--color-bg)] p-3">
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading || loading}
          className="flex-1 px-4 py-3 bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-soft)] focus:outline-none disabled:opacity-50"
          placeholder="اسأل عن المهام، اطلب تعديلات، أو احصل على تحليل للمشروع..."
        />
        <button
          type="submit"
          disabled={isLoading || loading || !input.trim()}
          className="inline-flex items-center gap-2 px-4 py-3 bg-[var(--color-accent)] text-[var(--color-ink)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          إرسال
        </button>
      </form>

      {/* Help Text */}
      <div className="text-[10px] text-center text-[var(--color-ink-soft)] font-mono">
        💡 يمكنك طلب إضافة مهام، تعديل الصعوبة، تغيير الحالة، إضافة أدوات، أو أي تعديلات أخرى
      </div>
    </div>
  );
}
