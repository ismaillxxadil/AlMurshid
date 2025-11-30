"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

type CoreModuleCardProps = {
  Icon: LucideIcon;
  title: string;
  description: string;
  iconClassName?: string;
};

export function CoreModuleCard({
  Icon,
  title,
  description,
  iconClassName = "text-[var(--color-ink-deep)]",
}: CoreModuleCardProps) {
  return (
    <div className="bg-[var(--color-surface)] p-10 hover:bg-[var(--color-panel)] transition-colors group relative">
      <div
        className={`absolute top-6 left-6 ${iconClassName} group-hover:text-[var(--color-ink)] transition-colors`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="mt-12">
        <h3 className="text-lg font-bold mb-2 text-[var(--color-ink)] font-mono">
          {title}
        </h3>
        <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed mb-6">
          {description}
        </p>
        <div className="flex items-center gap-2 text-xs text-[var(--color-ink)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          <span>LEARN MORE</span>
          <span className="inline-block w-3 h-3 border-l border-b border-[var(--color-ink)] rotate-45" />
        </div>
      </div>
    </div>
  );
}
