"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeSelector } from "@/components/ThemeSelector";
import { signOut } from "@/app/actions/auth";

type Theme = "dark" | "light" | "coffee" | "tvgirl" | "sonic" | "pikachu";

interface DashboardHeaderProps {
  theme: Theme;
  themeOptions: Theme[];
  onThemeChange: (value: string) => void;
  streak: number;
  loading: boolean;
  Skeleton: React.ComponentType<{ className?: string }>;
}

export function DashboardHeader({
  theme,
  themeOptions,
  onThemeChange,
  streak,
  loading,
  Skeleton,
}: DashboardHeaderProps) {
  return (
    <div className="tech-border-b bg-[var(--color-bg)]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo subtitle="SYSTEM::DASHBOARD" />

        <div className="flex items-center gap-6">
          {/* Gamified Streak Counter */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 border border-[var(--color-border)] bg-[var(--color-surface-alt)] min-w-[140px]">
            <Flame className="w-4 h-4 text-[var(--color-gold)] fill-[var(--color-gold)] animate-pulse" />
            {loading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <div className="text-xs font-mono font-bold">
                <span className="text-[var(--color-ink)]">{streak ?? 0}</span>
                <span className="text-[var(--color-ink-soft)] ml-1">
                  DAY_STREAK
                </span>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[var(--color-border)]"></div>

          <ThemeSelector
            theme={theme}
            options={themeOptions}
            onChange={onThemeChange}
            className="hidden md:block"
          />

          <div className="h-6 w-px bg-[var(--color-border)]"></div>

          <Link
            onClick={async () => {
              await signOut();
            }}
            href="/"
            className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-alt)] px-3 py-2 border border-transparent hover:border-[var(--color-border)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            LOGOUT
          </Link>
        </div>
      </div>
    </div>
  );
}
