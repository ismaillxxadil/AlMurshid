"use client";

import React from "react";
import { Logo } from "./Logo";
import Link from "next/link";

const productLinks = [
  { label: "المزايا", href: "#features" },
  { label: "التكامل مع Supabase", href: "#integrations" },
  { label: "الوثائق", href: "https://github.com/Othman1-hub/AlMurshid/blob/main/readme.md" },
  { label: "GitHub", href: "https://github.com/Othman1-hub/AlMurshid" },
];

const companyLinks = [
  { label: "حول المنصة", href: "#about" },
  { label: "الدعم", href: "mailto:support@almurshid.ai" },
  { label: "المجتمع", href: "https://github.com/Othman1-hub/AlMurshid" },
];

const legalLinks = [
  { label: "سياسة الخصوصية", href: "#" },
  { label: "شروط الاستخدام", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] pt-16 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14 text-sm">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <Logo size="sm" compact />
            </div>
            <p className="text-[var(--color-ink-muted)] leading-relaxed">
              AlMurshid: منصة Next.js تدعم العربية و RTL، متكاملة مع DeepSeek و Supabase لبناء مساعدين
              ذكيين يعملون على بياناتك بسرعة وأمان.
            </p>
          </div>

          <div>
            <h4 className="text-[var(--color-ink)] font-bold font-mono uppercase mb-4 tracking-wider text-xs">
              المنتج
            </h4>
            <ul className="space-y-3 text-[var(--color-ink-muted)]">
              {productLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[var(--color-ink)] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--color-ink)] font-bold font-mono uppercase mb-4 tracking-wider text-xs">
              الشركة
            </h4>
            <ul className="space-y-3 text-[var(--color-ink-muted)]">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[var(--color-ink)] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[var(--color-ink)] font-bold font-mono uppercase mb-4 tracking-wider text-xs">
              قانوني
            </h4>
            <ul className="space-y-3 text-[var(--color-ink-muted)]">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[var(--color-ink)] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-[var(--color-ink-dim)] font-mono">
          <div dir="ltr">© {new Date().getFullYear()} AlMurshid</div>
          <div className="flex gap-3 sm:gap-4 flex-wrap items-center">
            <span>القاهرة - مصر</span>
            <span className="text-[var(--color-border)]">|</span>
            <Link href="https://github.com/Othman1-hub/AlMurshid" className="hover:text-[var(--color-ink)]">
              الكود مفتوح المصدر
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
