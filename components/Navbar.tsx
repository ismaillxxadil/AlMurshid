"use client";

import React, { useEffect, useState } from "react";
import Button from "./Button";
import { Logo } from "./Logo";
import Link from "next/link";
import { ThemeSelector } from "./ThemeSelector";

type NavbarProps = {
  themeOptions?: string[];
};

const defaultThemeOptions = [
  "dark",
  "light",
  "coffee",
  "tvgirl",
  "sonic",
  "pikachu",
];

export const Navbar = ({ themeOptions = defaultThemeOptions }: NavbarProps) => {
  const [theme, setTheme] = useState<string>("dark");

  // hydrate from localStorage
  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("almurshed-theme")
        : null;
    if (stored && themeOptions.includes(stored)) {
      setTheme(stored);
    }
  }, [themeOptions]);

  // apply theme class to root
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove(...themeOptions);
      root.classList.add(theme);
      window.localStorage.setItem("almurshed-theme", theme);
    }
  }, [theme, themeOptions]);

  return (
    <>
      {/* Navbar */}
      <nav className="border-b border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Logo size="sm" compact />
          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeSelector
              theme={theme}
              options={themeOptions}
              onChange={(next) => setTheme(next)}
              className="hidden md:block"
            />
            <Link
              href="/sign-in"
              className="text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] font-mono"
            >
              Log In
            </Link>
            <Link href="/sign-up">
              <Button variant="default" size="sm" className="font-bold">
                Start Now with new account
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};
