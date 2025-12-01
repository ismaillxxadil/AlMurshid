"use client";

import React from "react";
import { Zap, Target, Sparkles, Award } from "lucide-react";

interface StatsGridProps {
  totalXp: number | null;
  questCompletion: string;
  tasksSummaryTotal: number;
  activeBadgesDisplay: string;
  loading: boolean;
  Skeleton: React.ComponentType<{ className?: string }>;
}

export function StatsGrid({
  totalXp,
  questCompletion,
  tasksSummaryTotal,
  activeBadgesDisplay,
  loading,
  Skeleton,
}: StatsGridProps) {
  const stats = [
    {
      label: "Total XP Earned",
      value:
        (totalXp ?? 0) > 0 ? `${((totalXp ?? 0) / 1000).toFixed(1)}k` : "0",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      label: "Quest Completion",
      value: questCompletion,
      icon: <Target className="w-4 h-4" />,
    },
    {
      label: "Total Tasks",
      value: loading ? "..." : tasksSummaryTotal.toString(),
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      label: "Active Badges",
      value: activeBadgesDisplay,
      icon: <Award className="w-4 h-4" />,
    },
  ];

  return (
    <div className="lg:col-span-5 grid grid-cols-2 gap-px bg-[var(--color-border)]">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-[var(--color-bg)] p-6 flex flex-col justify-between hover:bg-[var(--color-surface-alt)] transition-colors group cursor-default"
        >
          <div className="text-[var(--color-ink-soft)] group-hover:text-[var(--color-accent)] transition-colors mb-4 flex justify-between items-start">
            {stat.icon}
            <div className="w-1 h-1 bg-[var(--color-border)] group-hover:bg-[var(--color-accent)] transition-colors"></div>
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-3xl font-mono font-bold tracking-tighter">
                {stat.value}
              </div>
            )}
            <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-ink-soft)] mt-1 group-hover:text-[var(--color-ink)] transition-colors">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
