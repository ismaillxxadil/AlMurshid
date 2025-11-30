import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Sparkles, Compass, Undo2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] flex flex-col">
      <header className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <Logo compact />
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          <Undo2 className="w-4 h-4" />
          العودة للصفحة الرئيسية
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8">
          <div className="inline-flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 font-mono text-xs tracking-widest uppercase text-[var(--color-ink-muted)]">
            <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
            404 - إحداثيات غير معروفة
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            لم نعثر على هذه الوجهة، لكن خريطة المرشد جاهزة لتوجيهك.
          </h1>

          <p className="text-[var(--color-ink-muted)] text-lg leading-relaxed">
            قد تكون غيّرت المسار أو انتهت الجلسة. جرّب العودة للوحة التحكم أو ابدأ من جديد.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-ink)] text-[var(--color-bg)] border border-[var(--color-ink)] font-mono font-bold uppercase tracking-widest hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] hover:text-white transition-colors"
            >
              <Undo2 className="w-4 h-4" />
              العودة للصفحة الرئيسية
            </Link>
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] font-mono font-bold uppercase tracking-widest hover:border-[var(--color-ink)] transition-colors"
            >
              <Compass className="w-4 h-4 text-[var(--color-accent)]" />
              فتح لوحة التحكم
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
