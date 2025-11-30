"use client";

import React from "react";
import { Activity, Database, Shield } from "lucide-react";
import { CoreModuleCard } from "./CoreModuleCard";

const modules = [
  {
    title: "مهندس المشاريع الذكي",
    description:
      "يبني خارطة الطريق والمخططات التقنية تلقائياً بالاعتماد على DeepSeek وبياناتك في Supabase، مع توليد خطوات جاهزة للتنفيذ.",
    icon: Database,
    iconClassName: "text-[var(--color-ink-deep)]",
  },
  {
    title: "محرك التقدم",
    description:
      "يتابع إنجاز المهام، يحسب التقدم اليومي، ويعرض مؤشرات السرعة والتنبيه المبكر عن أي تأخير أو عائق.",
    icon: Activity,
    iconClassName: "text-[var(--color-accent)]",
  },
  {
    title: "درع التركيز",
    description:
      "يحمي جلسات العمل العميق بتنبيهات ذكية، وتذكيرات سياقية من ذاكرة المشروع، ويقلل التشتيت أثناء التنفيذ.",
    icon: Shield,
    iconClassName: "text-[var(--color-ink-deep)]",
  },
];

export function CoreModules() {
  return (
    <section className="py-24 bg-[var(--color-bg)]">
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl font-medium mb-4 text-[var(--color-ink)]">
            وحدات أساسية مبنية لخدمة فرق التطوير
          </h2>
          <p className="text-[var(--color-ink-muted)] font-light">
            ثلاثة أنظمة متكاملة لتوليد الخطط، مراقبة التنفيذ، وحماية التركيز باستخدام الذكاء الاصطناعي وبيانات فريقك الفعلية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-border)] border border-[var(--color-border)]">
          {modules.map((module) => (
            <CoreModuleCard
              key={module.title}
              Icon={module.icon}
              title={module.title}
              description={module.description}
              iconClassName={module.iconClassName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
