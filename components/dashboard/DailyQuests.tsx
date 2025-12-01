"use client";

import React from "react";
import { Trophy } from "lucide-react";

type Quest = {
  id: number;
  title: string;
  reward: number;
  completed: boolean;
};

interface DailyQuestsProps {
  dailyQuests: Quest[];
  onToggleQuest: (id: number) => void;
}

export function DailyQuests({ dailyQuests, onToggleQuest }: DailyQuestsProps) {
  return (
    <div className="lg:col-span-3 bg-[var(--color-surface-alt)] p-6 border-r border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-6 text-[var(--color-ink)]">
        <Trophy className="w-4 h-4 text-[var(--color-gold)]" />
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest">
          Daily Protocols
        </h3>
      </div>
      <div className="space-y-3">
        {dailyQuests.map((quest) => (
          <div
            key={quest.id}
            onClick={() => onToggleQuest(quest.id)}
            className={`p-3 border cursor-pointer transition-all relative group ${
              quest.completed
                ? "bg-[var(--color-success)]/10 border-[var(--color-success)]"
                : "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
            }`}
          >
            <div className="flex justify-between items-start">
              <span
                className={`text-xs font-mono ${
                  quest.completed
                    ? "text-[var(--color-success)] line-through"
                    : "text-[var(--color-ink)]"
                }`}
              >
                {quest.title}
              </span>
              {quest.completed && (
                <div className="w-2 h-2 bg-[var(--color-success)] rounded-full" />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`text-[10px] font-mono ${
                  quest.completed
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-gold)]"
                }`}
              >
                +{quest.reward} XP
              </span>
              {!quest.completed && (
                <div className="text-[9px] text-[var(--color-ink-soft)] opacity-0 group-hover:opacity-100">
                  CLICK TO COMPLETE
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
