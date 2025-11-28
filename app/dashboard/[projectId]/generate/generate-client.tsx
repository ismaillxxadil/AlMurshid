'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from 'ai/react';
import { isReadyToGenerate } from '@/lib/ai/prompts';

interface GeneratePageClientProps {
  projectId: number;
  projectName: string;
}

export default function GeneratePageClient({ projectId, projectName }: GeneratePageClientProps) {
  const router = useRouter();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'system-1',
        role: 'system' as const,
        content: 'مرحباً! أنا المرشد، مساعدك في تخطيط المشروع. دعني أساعدك في فهم مشروعك بشكل كامل.'
      }
    ],
  });

  // Check if AI is ready to generate
  const canGenerate = isReadyToGenerate(messages as any[]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGeneratePlan = async () => {
    if (!canGenerate || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          projectId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate plan');
      }

      const result = await response.json();
      
      if (result.success) {
        setGenerationComplete(true);
        // Redirect to project dashboard after a brief delay
        setTimeout(() => {
          router.push(`/dashboard/${projectId}`);
          router.refresh();
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      alert(error instanceof Error ? error.message : 'فشل في توليد الخطة');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-ink)]" dir="rtl">
      <div className="flex-1 flex flex-col gap-4 px-6 py-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[var(--color-ink-soft)]">توليد أولي</div>
            <div className="text-2xl font-semibold">تحدث مع المرشد عن: {projectName}</div>
          </div>
          <div className="text-xs font-mono text-[var(--color-ink-soft)]">
            هذه الخطوة لمرة واحدة لالتقاط الفكرة وبناء المهام والملخص.
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: '60vh' }}>
          <div className="h-full overflow-y-auto px-2 py-4 space-y-4 bg-[var(--color-bg)]">
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
                    <span className="animate-pulse">يكتب...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex flex-col gap-3 bg-[var(--color-bg)] p-3">
          {canGenerate && !generationComplete && (
            <div className="flex items-center justify-center mb-2">
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all ${
                  isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                }`}
              >
                {isGenerating ? (
                  <>
                    <span className="inline-block animate-spin">⚙️</span>
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    ✨ توليد الخطة الكاملة
                  </>
                )}
              </button>
            </div>
          )}
          
          {generationComplete && (
            <div className="flex items-center justify-center mb-2 text-green-600 font-semibold">
              ✅ تم توليد الخطة بنجاح! جاري التحويل...
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              value={input}
              onChange={handleInputChange}
              disabled={isLoading || isGenerating || generationComplete}
              className="flex-1 px-4 py-3 bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-soft)] focus:outline-none disabled:opacity-50"
              placeholder="اكتب وصف الفكرة، التقنيات، والمدد المستهدفة..."
            />
            <button
              type="submit"
              disabled={isLoading || isGenerating || generationComplete || !input.trim()}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[var(--color-accent)] text-[var(--color-ink)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إرسال
            </button>
          </form>

          {canGenerate && !generationComplete && (
            <div className="text-xs text-center text-green-600 font-mono">
              ✅ المرشد جاهز لتوليد الخطة - اضغط على الزر أعلاه
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
