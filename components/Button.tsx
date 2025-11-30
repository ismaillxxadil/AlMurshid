"use client";
import { useState } from "react";

type ButtonVariant = "default" | "outline" | "ghost" | "link" | "accent";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ink)] disabled:pointer-events-none disabled:opacity-50 font-mono tracking-wide border";

  const variants: Record<ButtonVariant, string> = {
    default:
      "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)] hover:bg-[var(--color-ink-soft-contrast)] hover:border-[var(--color-ink-soft-contrast)]",
    outline:
      "bg-transparent text-[var(--color-ink)] border-[var(--color-border-strong)] hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)]",
    ghost:
      "bg-transparent text-[var(--color-ink-soft)] border-transparent hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-alt)]",
    link: "bg-transparent text-[var(--color-ink)] border-transparent underline-offset-4 hover:underline p-0 h-auto",
    accent:
      "bg-[var(--color-accent)] text-[var(--color-ink)] border-[var(--color-accent)] hover:bg-[var(--color-accent-strong)]",
  };

  const sizes: Record<ButtonSize, string> = {
    default: "h-10 px-6 py-2 rounded-none",
    sm: "h-8 px-3 text-xs rounded-none",
    lg: "h-14 px-8 text-base rounded-none",
    icon: "h-10 w-10 p-2 rounded-none",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
