"use client";

import React, { useActionState, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { getUserDashboardData } from "../actions/auth";
import { addProject, updateProject, deleteProject } from "../actions/projects";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { DailyQuests } from "@/components/dashboard/DailyQuests";
import { AchievementsBadges } from "@/components/dashboard/AchievementsBadges";
import { ProjectsGrid } from "@/components/dashboard/ProjectsGrid";
import { NewProjectModal } from "@/components/dashboard/NewProjectModal";

type Theme = "dark" | "light" | "coffee" | "tvgirl" | "sonic" | "pikachu";
const themeOptions: Theme[] = [
  "dark",
  "light",
  "coffee",
  "tvgirl",
  "sonic",
  "pikachu",
];

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

type Quest = {
  id: number;
  title: string;
  reward: number;
  completed: boolean;
};

type Achievement = {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  earned_at?: string;
};

type TaskSummary = {
  total: number;
  completed: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("almurshed-theme");
    return stored && themeOptions.includes(stored as Theme)
      ? (stored as Theme)
      : "dark";
  });
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User data state
  const [username, setUsername] = useState("");
  const [userLevel, setUserLevel] = useState<number | null>(null);
  const [totalXp, setTotalXp] = useState<number | null>(null);
  const [currentXp, setCurrentXp] = useState(0);
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(
    null
  );

  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [tasksSummary, setTasksSummary] = useState<TaskSummary>({
    total: 0,
    completed: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [formOpen, setFormOpen] = useState(false);

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinProjectId, setJoinProjectId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const [collaborationModalOpen, setCollaborationModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectPassword, setProjectPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`skeleton ${className}`} aria-hidden />
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getUserDashboardData();

        if (data) {
          const totalXpValue = Number(data.stats.totalXp ?? 0);
          const levelValue =
            typeof data.stats.level === "number"
              ? data.stats.level
              : Math.floor(totalXpValue / 1000) + 1;

          setUsername(data.stats.username);
          setUserLevel(levelValue);
          setTotalXp(totalXpValue);
          setProjects((data.projects as Project[]) || []);
          setCurrentXp(totalXpValue % 1000);
          setUserProfilePicture(data.stats.userProfilePicture || null);
          setStreak(data.stats.streak ?? 0);
          setAchievements(
            (data.achievements as Achievement[] | undefined) || []
          );
          setTasksSummary({
            total: data.taskSummary?.total ?? 0,
            completed: data.taskSummary?.completed ?? 0,
          });
        } else {
          setTasksSummary({ total: 0, completed: 0 });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("almurshed-theme")
        : null;
    if (stored && themeOptions.includes(stored as Theme)) {
      setTheme(stored as Theme);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove(...themeOptions);
      root.classList.add(theme);
      localStorage.setItem("almurshed-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (selectedProject) {
      setProjectPassword(selectedProject.password ?? "");
      setShowPassword(false);
    }
  }, [selectedProject]);

  const xp = currentXp;
  const nextLevel = 5000;
  const xpProgress = loading
    ? 0
    : Math.min(100, (currentXp / nextLevel) * 100);
  const title = (totalXp ?? 0) > 4000 ? "Chief Architect" : "Systems Lead";
  const initials = useMemo(() => {
    const parts = username.trim().split(/\s+/).filter(Boolean);
    const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
    return (letters || username.slice(0, 2) || "U").toUpperCase();
  }, [username]);
  const hasPassword = Boolean(projectPassword);
  const displayedPassword = hasPassword
    ? projectPassword
    : "No pass set for this project";

  const questCompletion =
    tasksSummary.total > 0
      ? `${Math.round((tasksSummary.completed / tasksSummary.total) * 100)}%`
      : "0%";
  const activeBadgeCount = achievements.filter((a) => a.active ?? true).length;
  const activeBadgesDisplay =
    activeBadgeCount > 0 ? activeBadgeCount.toString().padStart(2, "0") : "0";

  const [formState, formAction] = useActionState(addProject, {
    error: undefined,
    success: undefined,
    values: { name: undefined, description: undefined },
  });

  useEffect(() => {
    if (formState.success && formState.project) {
      setFormOpen(false);
      router.push(`/dashboard/${formState.project.id}/generate`);
    }
  }, [formState.success, formState.project, router]);

  const handleEditProject = async (id: string, name: string) => {
    if (!name.trim()) return;

    // Optimistically update UI
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
    );

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      
      const result = await updateProject(Number(id), {}, formData);
      
      if (result.error) {
        console.error("Failed to update project:", result.error);
        // Revert on error - refetch data
        const data = await getUserDashboardData();
        if (data) {
          setProjects((data.projects as Project[]) || []);
        }
      }
    } catch (err) {
      console.error("Error updating project:", err);
      // Revert on error
      const data = await getUserDashboardData();
      if (data) {
        setProjects((data.projects as Project[]) || []);
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    // Optimistically update UI
    setProjects((prev) => prev.filter((p) => p.id !== id));

    try {
      const result = await deleteProject(Number(id));
      
      if (result.error) {
        console.error("Failed to delete project:", result.error);
        // Revert on error - refetch data
        const data = await getUserDashboardData();
        if (data) {
          setProjects((data.projects as Project[]) || []);
        }
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      // Revert on error
      const data = await getUserDashboardData();
      if (data) {
        setProjects((data.projects as Project[]) || []);
      }
    }
  };

  const fetchProjectCollaboration = (projectId: string) => {
    // TODO: Replace with actual API call
    // For now, generate a mock password
    setProjectPassword(
      Math.random().toString(36).substring(2, 15).toUpperCase()
    );
  };

  return (
    <div
      className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] selection:bg-[var(--color-ink)] selection:text-[var(--color-bg)] overflow-x-hidden transition-colors duration-300"
      dir="rtl"
    >
      {/* INJECTED CSS VARIABLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');
        
        :root, :root.dark {
          --color-bg: #050505;
          --color-surface: #0A0A0A;
          --color-surface-alt: #111111;
          --color-surface-contrast: #ffffff;
          --color-border: #222222;
          --color-border-strong: #444444;
          --color-ink: #ffffff;
          --color-ink-soft: #888888;
          --color-accent: #0044FF;
          --color-accent-strong: #0033CC;
          --color-success: #00FF9D;
          --color-gold: #FFD700;
        }

        :root.light {
          --color-bg: #ffffff;
          --color-surface: #f8f9fa;
          --color-surface-alt: #f1f3f5;
          --color-surface-contrast: #000000;
          --color-border: #e9ecef;
          --color-border-strong: #dee2e6;
          --color-ink: #212529;
          --color-ink-soft: #868e96;
          --color-accent: #0044FF;
          --color-accent-strong: #0033CC;
          --color-success: #00aa63;
          --color-gold: #d4af37;
        }

        :root.neon {
          --color-bg: #0a0a12;
          --color-surface: #13131f;
          --color-surface-alt: #1c1c2e;
          --color-surface-contrast: #00F3FF;
          --color-border: #2d2d45;
          --color-border-strong: #00F3FF;
          --color-ink: #e0e6ed;
          --color-ink-soft: #6b7280;
          --color-accent: #00F3FF;
          --color-accent-strong: #00c4cc;
          --color-success: #39ff14;
          --color-gold: #ff00ff;
        }

        body { font-family: 'IBM Plex Sans Arabic', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        .bg-grid-pattern {
          background-image: linear-gradient(var(--color-border) 1px, transparent 1px),
                            linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }

        .tech-border-b { border-bottom: 1px solid var(--color-border); }

        .skeleton {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.08));
          background-color: var(--color-surface-alt);
          border: 1px solid var(--color-border);
        }

        .skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
          animation: shimmer 1.4s infinite;
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Header */}
      <DashboardHeader
        theme={theme}
        themeOptions={themeOptions}
        onThemeChange={(value) => setTheme(value as Theme)}
        streak={streak}
        loading={loading}
        Skeleton={Skeleton}
      />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12 relative">
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-[0.03] z-0" />

        {/* Profile & Stats Section */}
        <section className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-px bg-[var(--color-border)] border border-[var(--color-border)]">
          {/* User Info & XP (Left) */}
          <ProfileCard
            username={username}
            title={title}
            userLevel={userLevel}
            userProfilePicture={userProfilePicture}
            currentXp={currentXp}
            nextLevel={nextLevel}
            xpProgress={xpProgress}
            loading={loading}
            Skeleton={Skeleton}
          />

          {/* Gamified Stats Grid (Right) */}
          <StatsGrid
            totalXp={totalXp}
            questCompletion={questCompletion}
            tasksSummaryTotal={tasksSummary.total}
            activeBadgesDisplay={activeBadgesDisplay}
            loading={loading}
            Skeleton={Skeleton}
          />

          {/* Daily Protocols (Quests) */}
          <DailyQuests />
        </section>

        {/* Achievements / Badges Strip */}
        <AchievementsBadges
          achievements={achievements}
          loading={loading}
          Skeleton={Skeleton}
        />

        {/* Projects Section */}
        <ProjectsGrid
          projects={projects}
          onOpenForm={() => setFormOpen(true)}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onJoinProject={() => {
            setJoinModalOpen(true);
            setJoinError(null);
            setJoinProjectId("");
            setJoinPassword("");
          }}
          onShareProject={(project) => {
            setSelectedProject(project);
            setCollaborationModalOpen(true);
            setProjectPassword(project.password ?? "");
            setShowPassword(false);
          }}
        />
      </main>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        formAction={formAction}
        formError={formState.error}
      />

      {/* Join Project Modal */}
      {joinModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-bg)]/90 backdrop-blur-sm"
          dir="rtl"
        >
          <div className="w-full max-w-md bg-[var(--color-bg)] border border-[var(--color-accent)] shadow-[0_0_50px_-10px_rgba(0,68,255,0.2)] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-[var(--color-accent)]">
                <AlertCircle className="w-4 h-4" />
                <span>JOIN_PROJECT.EXE</span>
              </div>
              <button
                onClick={() => setJoinModalOpen(false)}
                className="hover:text-[var(--color-accent)] font-mono"
              >
                [ESC]
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setJoinLoading(true);
                setJoinError(null);
                setJoinSuccess(false);

                const formattedId = joinProjectId.trim();
                const passwordInput = joinPassword.trim();
                const separatorIndex = formattedId.lastIndexOf("-");

                if (separatorIndex === -1) {
                  setJoinError("Invalid project ID format (expected NAME-ID)");
                  setJoinLoading(false);
                  return;
                }

                const projectNamePart = formattedId
                  .slice(0, separatorIndex)
                  .trim();
                const projectIdPart = formattedId
                  .slice(separatorIndex + 1)
                  .trim();
                const projectIdNumeric = Number(projectIdPart);

                if (
                  !projectNamePart ||
                  !projectIdPart ||
                  Number.isNaN(projectIdNumeric)
                ) {
                  setJoinError("Invalid project ID format (missing name or id)");
                  setJoinLoading(false);
                  return;
                }

                try {
                  const res = await fetch("/api/join-team", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      projectId: projectIdNumeric,
                      projectName: projectNamePart,
                      password: passwordInput,
                    }),
                  });

                  const result = await res.json();

                  if (!res.ok) {
                    setJoinError(result?.message || "Failed to join this project");
                    setJoinLoading(false);
                    return;
                  }

                  setJoinSuccess(true);
                  setTimeout(() => {
                    setJoinModalOpen(false);
                    router.push(`/dashboard/${result.projectId}`);
                  }, 800);
                } catch (err) {
                  console.error("Join project failed", err);
                  setJoinError("Failed to join this project (unexpected error)");
                } finally {
                  setJoinLoading(false);
                }
              }}
              className="p-8 space-y-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-[var(--color-ink-soft)] flex items-center gap-2">
                  <span className="w-1 h-1 bg-[var(--color-accent)]"></span>{" "}
                  Project ID
                </label>
                <input
                  value={joinProjectId}
                  onChange={(e) => setJoinProjectId(e.target.value.trimStart())}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-ink-soft)]/30 transition-colors"
                  placeholder="ENTER_PROJECT_NAME-ID..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-[var(--color-ink-soft)] flex items-center gap-2">
                  <span className="w-1 h-1 bg-[var(--color-accent)]"></span>{" "}
                  Collaboration Password
                </label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value.trimStart())}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] p-3 font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-ink-soft)]/30 transition-colors"
                  placeholder="ENTER_PASSWORD..."
                  required
                />
              </div>

              {joinError && (
                <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 text-xs font-mono">
                  ERROR: {joinError}
                </div>
              )}

              <div className="pt-6 flex justify-end gap-4 border-t border-[var(--color-border)] mt-2">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="px-6 py-3 border border-[var(--color-border)] text-xs font-mono font-bold hover:bg-[var(--color-surface-alt)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={joinLoading}
                  className="px-6 py-3 bg-[var(--color-accent)] text-white border border-[var(--color-accent)] text-xs font-mono font-bold hover:bg-[var(--color-accent-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {joinLoading ? "JOINING..." : "JOIN_PROJECT"}
                </button>
              </div>

              {joinSuccess && (
                <div className="mt-4 text-center text-xs font-mono text-[var(--color-success)]">
                  Project joined successfully! Redirecting...
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Collaboration/Share Modal */}
      {collaborationModalOpen && selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-bg)]/90 backdrop-blur-sm"
          dir="rtl"
        >
          <div className="w-full max-w-xl max-h-[85vh] bg-[var(--color-bg)] border border-[var(--color-accent)] shadow-[0_0_50px_-10px_rgba(0,68,255,0.2)] animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-[var(--color-accent)]">
                <span>SHARE_PROJECT.EXE</span>
              </div>
              <button
                onClick={() => setCollaborationModalOpen(false)}
                className="hover:text-[var(--color-accent)] font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              <div>
                <h2 className="text-lg font-bold mb-2">
                  {selectedProject.name}
                </h2>
                <p className="text-xs text-[var(--color-ink-soft)] font-mono">
                  Share these credentials with your teammates to invite them
                </p>
              </div>

              {/* Project ID Section */}
              <div className="space-y-3 p-4 border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                <label className="text-xs font-mono uppercase tracking-widest text-[var(--color-ink-soft)]">
                  PROJECT_ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${selectedProject.name}-${selectedProject.id}`}
                    readOnly
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] p-3 font-mono text-sm text-[var(--color-ink)] focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${selectedProject.name}-${selectedProject.id}`
                      );
                      alert("Project ID copied!");
                    }}
                    className="px-4 py-3 border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-accent)] hover:text-[var(--color-ink)] text-xs font-mono font-bold transition-colors flex items-center gap-2"
                  >
                    📋 COPY
                  </button>
                </div>
                <div className="text-[9px] text-[var(--color-ink-soft)] font-mono">
                  Format: ProjectName-ID (e.g., MyApp-42)
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-3 p-4 border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                <label className="text-xs font-mono uppercase tracking-widest text-[var(--color-ink-soft)]">
                  COLLABORATION_PASSWORD
                </label>
                <div className="flex gap-2">
                  <input
                    type={hasPassword && !showPassword ? "password" : "text"}
                    value={displayedPassword}
                    readOnly
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] p-3 font-mono text-sm text-[var(--color-ink)] focus:outline-none"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-4 py-3 border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] text-[var(--color-accent)] text-xs font-mono font-bold transition-colors"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(projectPassword);
                      alert("Password copied!");
                    }}
                    disabled={!projectPassword}
                    className="px-4 py-3 border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-accent)] text-[var(--color-accent)] hover:text-[var(--color-ink)] text-xs font-mono font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    📋 COPY
                  </button>
                </div>
              </div>

              {/* Invite Link Section */}
              <div className="space-y-3 p-4 border border-[var(--color-accent)] bg-[var(--color-surface-alt)]">
                <label className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-bold">
                  🔗 INVITE_LINK (Share This)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={
                      projectPassword
                        ? `${window.location.origin}/dashboard/join?projectId=${selectedProject.id}&projectName=${selectedProject.name}&password=${projectPassword}`
                        : "Generate password first"
                    }
                    readOnly
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] p-3 font-mono text-[10px] text-[var(--color-ink-soft)] focus:outline-none overflow-x-auto"
                  />
                  <button
                    onClick={() => {
                      const inviteLink = `${window.location.origin}/dashboard/join?projectId=${selectedProject.id}&projectName=${selectedProject.name}&password=${projectPassword}`;
                      navigator.clipboard.writeText(inviteLink);
                      alert("Invite link copied!");
                    }}
                    disabled={!projectPassword}
                    className="px-4 py-3 border border-[var(--color-accent)] bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] text-[var(--color-accent)] hover:text-[var(--color-ink)] text-xs font-mono font-bold transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    🔗 COPY_LINK
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] p-4 space-y-2">
                <div className="text-xs font-mono font-bold text-[var(--color-accent)]">
                  📖 HOW_TO_SHARE:
                </div>
                <ol className="text-[10px] text-[var(--color-ink-soft)] font-mono space-y-1 list-decimal list-inside">
                  <li>Copy the INVITE_LINK and send to teammates</li>
                  <li>
                    OR send PROJECT_ID and PASSWORD separately for security
                  </li>
                  <li>Teammate clicks link or enters ID + password on JOIN_PROJECT</li>
                  <li>They'll be added as a team member</li>
                </ol>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCollaborationModalOpen(false)}
                  className="px-4 py-3 border border-[var(--color-border)] text-xs font-mono font-bold hover:bg-[var(--color-surface-alt)] transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
