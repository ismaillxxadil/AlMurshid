"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

type ThemeSelectorProps = {
  theme: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
};

export function ThemeSelector({
  theme,
  options,
  onChange,
  className = "",
}: ThemeSelectorProps) {
  return (
    <div className={`relative group ${className}`}>
      <select
        value={theme}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2 pr-8 focus:outline-none focus:border-[var(--color-accent)] rounded-none cursor-pointer font-mono text-xs font-bold uppercase tracking-widest"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.toUpperCase()}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-ink-soft)]" />
    </div>
  );
}
