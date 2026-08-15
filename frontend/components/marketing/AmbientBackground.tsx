"use client";
/**
 * Layered dark background for the marketing landing page only. Deep navy
 * base + soft radial gradients + a faint grid + two slow-drifting blurred
 * blobs, all done with CSS transforms/opacity (GPU-cheap, no canvas) so it
 * never competes with the AIOrb's WebGL budget. Respects reduced-motion.
 */
export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-night-base" aria-hidden="true">
      {/* base radial glow field */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(8,126,164,0.22) 0%, transparent 55%)," +
            "radial-gradient(ellipse 70% 50% at 85% 20%, rgba(18,184,166,0.14) 0%, transparent 50%)," +
            "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(167,139,250,0.10) 0%, transparent 55%)",
        }}
      />
      {/* faint grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* slow-drifting blurred blobs — motion-safe only */}
      <div className="motion-safe:animate-[driftA_22s_ease-in-out_infinite] absolute -top-20 left-[10%] w-[420px] h-[420px] rounded-full blur-[110px] opacity-30"
        style={{ background: "radial-gradient(circle, #087EA4, transparent 70%)" }} />
      <div className="motion-safe:animate-[driftB_28s_ease-in-out_infinite] absolute bottom-[-10%] right-[8%] w-[480px] h-[480px] rounded-full blur-[120px] opacity-25"
        style={{ background: "radial-gradient(circle, #A78BFA, transparent 70%)" }} />

      <style>{`
        @keyframes driftA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(40px, 30px); } }
        @keyframes driftB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px, -40px); } }
      `}</style>
    </div>
  );
}
