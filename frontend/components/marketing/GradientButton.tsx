"use client";
import Link from "next/link";
import { ReactNode } from "react";

export function GradientButton({ href, children, variant = "primary", className = "" }: {
  href: string; children: ReactNode; variant?: "primary" | "secondary"; className?: string;
}) {
  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium border border-night-border bg-night-surface text-night-text hover:bg-night-surfaceStrong hover:border-white/20 transition-all duration-300 ${className}`}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-night-deep transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_36px_rgba(103,232,249,0.35)] ${className}`}
      style={{ background: "linear-gradient(135deg, #67E8F9 0%, #087EA4 55%, #12B8A6 100%)" }}
    >
      {children}
    </Link>
  );
}
