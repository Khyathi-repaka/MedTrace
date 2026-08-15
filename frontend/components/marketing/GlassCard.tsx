"use client";
import { ReactNode } from "react";

export function GlassCard({ children, className = "", strong = false }: { children: ReactNode; className?: string; strong?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-night-border backdrop-blur-xl transition-all duration-300
        hover:border-white/20 hover:-translate-y-1
        ${strong ? "bg-night-surfaceStrong" : "bg-night-surface"} ${className}`}
    >
      {children}
    </div>
  );
}
