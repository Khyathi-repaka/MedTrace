"use client";
import dynamic from "next/dynamic";
import SoundToggle from "@/components/SoundToggle";
import CursorGlow from "@/components/CursorGlow";

// Three.js touches window/canvas at import time — must be client-only,
// so it's dynamically imported with ssr disabled rather than a top-level
// import, which would break `next build`'s server-side render pass.
const Hero3D = dynamic(() => import("@/components/Hero3D"), { ssr: false });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden px-4">
      <Hero3D />
      <CursorGlow />
      <div className="absolute top-4 right-4 z-10">
        <SoundToggle />
      </div>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
