"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Edit2, Trash2 } from "lucide-react";

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

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onShare?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onShare }: ProjectCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const statusColor = useMemo(
    () => ({
      Active:
        "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5",
      Review:
        "border-[var(--color-ink)] text-[var(--color-ink)] bg-[var(--color-surface-alt)]",
      Planning:
        "border-[var(--color-ink-soft)] text-[var(--color-ink-soft)] border-dashed",
      Paused:
        "border-[var(--color-border)] text-[var(--color-ink-soft)] opacity-60",
    }),
    []
  );

  const handleSave = () => {
    onEdit(project.id, editingName);
    setEditingId(null);
    setEditingName("");
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete?")) {
      onDelete(project.id);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(project);
    }
  };

  return (
    <div className="group relative bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all p-6 flex flex-col justify-between min-h-[240px]">
      {/* Hover Corner Effect */}
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-transparent border-r-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      {/* Top Bar */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div
          className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest border ${
            statusColor[project.status]
          }`}
        >
          {project.status}
        </div>
        <div className="font-mono text-xs text-[var(--color-ink-soft)] group-hover:text-[var(--color-ink)] transition-colors">
          {project.id}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative z-10">
        {editingId === project.id ? (
          <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
            <input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] p-2 text-sm font-bold focus:outline-none focus:border-[var(--color-accent)]"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="text-xs bg-[var(--color-accent)] text-white px-3 py-1 font-bold hover:bg-[var(--color-accent-strong)]"
              >
                SAVE
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(null);
                }}
                className="text-xs border border-[var(--color-border)] px-3 py-1 hover:bg-[var(--color-surface-alt)]"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link href={`/dashboard/${project.id}`}>
              <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-accent)] transition-colors cursor-pointer">
                {project.name}
              </h3>
            </Link>
          </>
        )}
        <div className="text-xs text-[var(--color-ink-soft)] font-mono mt-4 flex gap-4 border-t border-[var(--color-border)] pt-4 border-dashed">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" /> {project.tasks} TASKS
          </span>
          <span>ETA: {project.eta}</span>
        </div>
      </div>

      {/* Footer / Progress */}
      <div className="mt-6 relative z-10 space-y-3">
        {/* Reward Pill */}
        <div className="flex justify-end">
          <span className="text-[9px] font-mono text-[var(--color-gold)] bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 px-2 py-0.5">
            REWARD: {project.xpReward} XP
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/dashboard/${project.id}`}
            className="relative inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-ink)] text-[var(--color-bg)] text-[11px] font-mono font-bold uppercase tracking-widest border border-[var(--color-ink)] hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3 h-3 rotate-180" />
            Open Project
          </Link>

          {/* Action Buttons */}
          <div className="flex gap-1">
            {onShare && (
              <button
                onClick={handleShareClick}
                className="relative p-1.5 hover:bg-[var(--color-surface-alt)] text-[var(--color-ink-soft)] hover:text-[var(--color-accent)] transition-colors border border-transparent hover:border-[var(--color-border)]"
                title="Share Project"
              >
                🔗
              </button>
            )}
            <button
              onClick={handleEditClick}
              className="relative p-1.5 hover:bg-[var(--color-surface-alt)] text-[var(--color-ink-soft)] hover:text-[var(--color-accent)] transition-colors border border-transparent hover:border-[var(--color-border)]"
              title="Edit Name"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="relative p-1.5 hover:bg-[var(--color-surface-alt)] text-[var(--color-ink-soft)] hover:text-red-500 transition-colors border border-transparent hover:border-[var(--color-border)]"
              title="Delete Project"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex justify-between text-[10px] font-mono mb-2 uppercase tracking-widest text-[var(--color-ink-soft)]">
          <span>Completion</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-1 w-full bg-[var(--color-surface-alt)] overflow-hidden">
          <div
            className="h-full bg-[var(--color-ink)] group-hover:bg-[var(--color-accent)] transition-colors"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
