"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Stat = { label: string; value: string };

const numberLabel = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

const relativeDays = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  const diffDays = Math.max(
    0,
    Math.round((now - then) / (1000 * 60 * 60 * 24))
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

export function StatsStrip() {
  const [usersCount, setUsersCount] = useState<string>("—");
  const [projectsCount, setProjectsCount] = useState<string>("—");
  const [gitStars, setGitStars] = useState<string>("—");
  const [lastPush, setLastPush] = useState<string>("—");

  useEffect(() => {
    const supabase = createClient();

    const fetchCounts = async () => {
      try {
        const [{ count: profileCount }, { count: projectCount }] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("projects")
              .select("*", { count: "exact", head: true }),
          ]);

        if (typeof profileCount === "number") {
          setUsersCount(numberLabel(profileCount));
        }
        if (typeof projectCount === "number") {
          setProjectsCount(numberLabel(projectCount));
        }
      } catch (error) {
        console.error("Failed to load counts", error);
      }
    };

    const fetchGitHub = async () => {
      try {
        const res = await fetch(
          "https://api.github.com/repos/Othman1-hub/AlMurshid",
          {
            headers: { Accept: "application/vnd.github+json" },
          }
        );
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data = await res.json();
        setGitStars(numberLabel(data.stargazers_count ?? 0));
        setLastPush(relativeDays(data.pushed_at));
      } catch (error) {
        console.error("Failed to fetch repo stats", error);
      }
    };

    fetchCounts();
    fetchGitHub();
  }, []);

  const stats: Stat[] = [
    { label: "Total Users", value: usersCount },
    { label: "Projects Created", value: projectsCount },
    { label: "GitHub Stars", value: gitStars },
  ];

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container mx-auto py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="relative overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg)]/70 backdrop-blur-sm px-4 py-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-accent)] group"
          >
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 bg-[radial-gradient(circle_at_15%_20%,var(--color-accent),transparent_30%),radial-gradient(circle_at_80%_80%,var(--color-ink),transparent_35%)] transition-opacity" />
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[var(--color-ink-muted)] mb-2">
              <span>{stat.label}</span>
              <span className="px-2 py-0.5 border border-[var(--color-border)] text-[var(--color-ink-soft)] bg-[var(--color-surface-alt)]">
                Live
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-[var(--color-ink)] truncate">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
