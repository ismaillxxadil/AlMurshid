"use client";

import React from "react";
import { Plus } from "lucide-react";
import { ProjectCard } from "./ProjectCard";

type Project = {
  id: string;
  name: string;
  status: "Active" | "Planning" | "Paused" | "Review";
  password?: string | null;
  eta: string;
  tasks: number;
  progress: number;
  xpReward: number;
};

interface ProjectsGridProps {
  projects: Project[];
  onOpenForm: () => void;
  onEditProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
  onJoinProject?: () => void;
  onShareProject?: (project: Project) => void;
}

export function ProjectsGrid({
  projects,
  onOpenForm,
  onEditProject,
  onDeleteProject,
  onJoinProject,
  onShareProject,
}: ProjectsGridProps) {
  return (
    <section className="relative z-10 space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[var(--color-accent)]"></div>
          <h2 className="text-lg font-bold font-mono tracking-tight">
            ACTIVE MISSIONS
          </h2>
          <span className="text-xs text-[var(--color-ink-soft)] font-mono bg-[var(--color-surface-alt)] px-2 py-0.5 rounded-none">
            COUNT: {projects.length}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onOpenForm}
            className="group flex items-center gap-2 px-5 py-2 bg-[var(--color-ink)] text-[var(--color-bg)] hover:bg-[var(--color-accent)] hover:text-white transition-all font-mono text-xs font-bold uppercase tracking-widest rounded-none"
          >
            <Plus className="w-4 h-4" />
            INITIALIZE_NEW
          </button>

          {onJoinProject && (
            <button
              onClick={onJoinProject}
              className="group flex items-center gap-2 px-5 py-2 border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)] transition-all font-mono text-xs font-bold uppercase tracking-widest rounded-none"
            >
              🔗 JOIN_PROJECT
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <ProjectCard
            key={proj.id}
            project={proj}
            onEdit={onEditProject}
            onDelete={onDeleteProject}
            onShare={onShareProject}
          />
        ))}
      </div>
    </section>
  );
}
