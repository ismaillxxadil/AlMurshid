"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Activity } from "lucide-react";

interface ProfileCardProps {
  username: string;
  title: string;
  userLevel: number | null;
  userProfilePicture: string | null;
  currentXp: number;
  nextLevel: number;
  xpProgress: number;
  loading: boolean;
  Skeleton: React.ComponentType<{ className?: string }>;
}

export function ProfileCard({
  username,
  title,
  userLevel,
  userProfilePicture,
  currentXp,
  nextLevel,
  xpProgress,
  loading,
  Skeleton,
}: ProfileCardProps) {
  const initials = useMemo(() => {
    const parts = username.trim().split(/\s+/).filter(Boolean);
    const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
    return (letters || username.slice(0, 2) || "U").toUpperCase();
  }, [username]);

  return (
    <div className="lg:col-span-4 bg-[var(--color-bg)] p-8 flex flex-col justify-between min-h-[200px]">
      <div className="flex items-start justify-between">
        <div>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">{username}</h1>
              <div className="text-xs font-mono text-[var(--color-accent)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse" />
                {title}
              </div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase border border-[var(--color-border-strong)] bg-[var(--color-surface-alt)] px-2 py-1 text-[var(--color-ink)]">
                <Activity className="w-3 h-3 text-[var(--color-accent)]" />{" "}
                Level {String(userLevel ?? 0).padStart(2, "0")}
              </div>
            </>
          )}
        </div>

        {/* Rank Badge */}
        <div className="relative group cursor-help">
          {loading ? (
            <Skeleton className="w-16 h-16 rounded-full border border-[var(--color-border)]" />
          ) : (
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-accent)] via-[var(--color-gold)] to-[var(--color-ink)] opacity-60 blur-sm" />
              <div className="relative w-full h-full rounded-full overflow-hidden border border-[var(--color-border-strong)] bg-[var(--color-surface-alt)] shadow-[0_0_0_2px_var(--color-bg)]">
                {userProfilePicture ? (
                  <Image
                    src={userProfilePicture}
                    alt="user profile picture"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-xl font-bold font-mono text-[var(--color-ink)] bg-[var(--color-accent)]/10">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_30%_30%,var(--color-ink)/10,transparent_45%),radial-gradient(circle_at_70%_70%,var(--color-accent)/10,transparent_40%)]" />
              </div>
            </div>
          )}
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[var(--color-surface)] border border-[var(--color-border)] p-2 text-[10px] font-mono whitespace-nowrap z-20">
            RANK: ALPHA ARCHITECT
          </div>
        </div>
      </div>

      {/* XP System Bar */}
      <div className="mt-8">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-full" />
            <div className="flex justify-between text-[9px] font-mono text-[var(--color-ink-soft)]">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-[10px] font-mono mb-2 text-[var(--color-ink-soft)]">
              <span>SYSTEM_CHARGE (XP)</span>
              <span className="text-[var(--color-accent)]">
                {currentXp} / {nextLevel}
              </span>
            </div>
            <div className="h-3 w-full bg-[var(--color-surface-alt)] relative overflow-hidden border border-[var(--color-border)]">
              <div
                className="h-full bg-[var(--color-accent)] absolute top-0 right-0 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
              {/* Grid lines over bar */}
              <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhZWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-30"></div>
            </div>
            <div className="mt-1 flex justify-between text-[9px] font-mono text-[var(--color-ink-soft)]">
              <span>NEXT_REWARD: UNLOCK_BETA_ACCESS</span>
              <span>{xpProgress.toFixed(1)}% LOADED</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
