import React from "react";
import Button from "./Button";
import { Play, Terminal } from "lucide-react";
import Link from "next/link";

function HeroSectionLandingPage() {
  return (
    <header className="relative pt-32 pb-32 flex flex-col items-start justify-center px-6 border-b border-[var(--color-border)]">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Text */}
        <div className="text-right">
          <h1 className="text-5xl md:text-7xl font-medium leading-tight mb-8 text-[var(--color-ink)] tracking-tighter">
            هندسة البرمجيات <br />
            <span className="text-[var(--color-ink-muted)]">بمنظور مختلف.</span>
          </h1>

          <p className="text-lg text-[var(--color-ink-soft)] max-w-xl mb-10 leading-relaxed font-light">
            المرشد ليس مجرد أداة تخطيط. إنه نظام تشغيل متكامل للمطورين العرب،
            يحول الأفكار المجردة إلى خطط تنفيذية دقيقة باستخدام الذكاء
            الاصطناعي.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/sign-up">
              <Button variant="default" size="lg" className="gap-3">
                <Terminal className="w-4 h-4" />
                ابداء اول مشروع لك اللان!
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-3">
              <Play className="w-4 h-4" />
              كيف يعمل النظام؟
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-xs text-[var(--color-ink-dim)] font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              SYSTEM OPERATIONAL
            </div>
            <div>|</div>
            <div>LATENCY: 12ms</div>
          </div>
        </div>

        {/* Right Column: Abstract Visual */}
        <div className="relative hidden lg:block">
          <div className="w-full aspect-square border border-[var(--color-border)] bg-[var(--color-surface)] p-1 relative">
            {/* Mockup Interface */}
            <div className="w-full h-full border border-[var(--color-border)] bg-[var(--color-surface-contrast)] p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8 border-b border-[var(--color-border)] pb-4">
                <div className="font-mono text-xs text-[var(--color-ink-muted)]">
                  ID: PROJ-8821
                </div>
                <div className="font-mono text-xs text-[var(--color-accent)]">
                  PROCESSING
                </div>
              </div>
              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between text-[var(--color-ink-soft)]">
                  <span>&gt; Analyzing Requirements</span>
                  <span className="text-green-500">DONE</span>
                </div>
                <div className="flex justify-between text-[var(--color-ink-soft)]">
                  <span>&gt; Generating Schema</span>
                  <span className="text-green-500">DONE</span>
                </div>
                <div className="flex justify-between text-[var(--color-ink-soft)]">
                  <span>&gt; Optimizing Roadmap</span>
                  <span className="text-[var(--color-ink)] blink animate-pulse">
                    ...
                  </span>
                </div>
              </div>
              <div className="mt-auto grid grid-cols-3 gap-1 h-24">
                <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)]"></div>
                <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)]"></div>
                <div className="bg-[var(--color-accent)] border border-[var(--color-border)]"></div>
              </div>
            </div>

            {/* Decorative floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t border-r border-[var(--color-border-strong)]"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b border-l border-[var(--color-border-strong)]"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeroSectionLandingPage;
