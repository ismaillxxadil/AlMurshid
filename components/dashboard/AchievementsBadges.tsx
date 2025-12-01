"use client";

import React from "react";
import { Sparkles, Shield } from "lucide-react";

type Achievement = {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  earned_at?: string;
};

interface AchievementsBadgesProps {
  achievements: Achievement[];
  loading: boolean;
  Skeleton: React.ComponentType<{ className?: string }>;
}

export function AchievementsBadges({
  achievements,
  loading,
  Skeleton,
}: AchievementsBadgesProps) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {loading ? (
        Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 border border-[var(--color-border)] bg-[var(--color-bg)]"
          >
            <Skeleton className="w-10 h-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))
      ) : achievements.length === 0 ? (
        <div className="col-span-2 md:col-span-4 border border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center text-xs font-mono text-[var(--color-ink-soft)] uppercase tracking-widest">
          No achievements unlocked yet
        </div>
      ) : (
        achievements.map((badge) => {
          const isActive = badge.active ?? true;
          return (
            <div
              key={badge.id}
              className={`flex items-center gap-4 p-4 border ${
                isActive
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-[var(--color-border)] bg-[var(--color-bg)] opacity-70"
              }`}
            >
              <div
                className={`p-2 ${
                  isActive
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-ink-soft)]"
                }`}
              >
                {isActive ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold font-mono uppercase">
                  {badge.name}
                </div>
                <div className="text-[10px] text-[var(--color-ink-soft)] font-mono">
                  {badge.description || "Achievement unlocked"}
                </div>
                {badge.earned_at && (
                  <div className="text-[9px] text-[var(--color-ink-soft)] font-mono mt-1">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
