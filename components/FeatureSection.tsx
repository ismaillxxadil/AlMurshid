import React from "react";
import Button from "./Button";
import { LayoutGrid } from "lucide-react";
import Badge from "./Badge";

function FeatureSection() {
  return (
    <section className="py-24 border-y border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            {/* Abstract Grid Visual */}
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/3] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 flex flex-col justify-between hover:border-[var(--color-ink)] transition-colors cursor-crosshair">
                <div className="w-8 h-8 border border-[var(--color-border-strong)] flex items-center justify-center text-[var(--color-ink-muted)] text-xs">
                  01
                </div>
                <div className="font-mono text-xs text-[var(--color-ink-muted)]">
                  FRONTEND_INIT
                </div>
              </div>
              <div className="aspect-[4/3] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 flex flex-col justify-between hover:border-[var(--color-ink)] transition-colors cursor-crosshair">
                <div className="w-8 h-8 border border-[var(--color-border-strong)] flex items-center justify-center text-[var(--color-ink-muted)] text-xs">
                  02
                </div>
                <div className="font-mono text-xs text-[var(--color-ink-muted)]">
                  BACKEND_API
                </div>
              </div>
              <div className="aspect-[4/3] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 flex flex-col justify-between hover:border-[var(--color-ink)] transition-colors cursor-crosshair">
                <div className="w-8 h-8 border border-[var(--color-border-strong)] flex items-center justify-center text-[var(--color-ink-muted)] text-xs">
                  03
                </div>
                <div className="font-mono text-xs text-[var(--color-ink-muted)]">
                  DB_SCHEMA
                </div>
              </div>
              <div className="aspect-[4/3] bg-[var(--color-accent)] p-6 flex flex-col justify-between text-[var(--color-ink)]">
                <LayoutGrid className="w-6 h-6" />
                <div className="font-mono text-xs font-bold">DEPLOY</div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 text-right">
            <Badge className="mb-6 bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]">
              ARCHITECTURE
            </Badge>
            <h2 className="text-4xl font-medium text-[var(--color-ink)] mb-6">
              بنية تحتية <br />
              قابلة للتوسع
            </h2>
            <p className="text-[var(--color-ink-soft)] text-lg font-light leading-relaxed mb-8">
              لا نكتفي بإعطائك قائمة مهام. نظام المرشد يقوم ببناء هيكلية المشروع
              بناءً على أفضل الممارسات العالمية (Clean Architecture)، مما يضمن
              لك كوداً نظيفاً وقابلاً للصيانة.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                "تكامل تلقائي مع GitHub & GitLab",
                "دعم كامل لـ CI/CD Pipelines",
                "توليد وثائق المشروع (Documentation) تلقائياً",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-[var(--color-ink-soft-contrast)] font-light"
                >
                  <div className="w-1.5 h-1.5 bg-[var(--color-accent)]"></div>
                  {item}
                </li>
              ))}
            </ul>

            <Button variant="outline" className="px-8">
              اقرأ التقرير التقني
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
