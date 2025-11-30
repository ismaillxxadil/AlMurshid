import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

function Badge({ children, className = "" }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center border border-[var(--color-border-strong)] bg-[var(--color-surface-alt)] px-2 py-1 text-[10px] font-mono text-[var(--color-ink-soft)] uppercase tracking-wider rounded-none ${className}`}
    >
      {children}
    </div>
  );
}

export default Badge;
