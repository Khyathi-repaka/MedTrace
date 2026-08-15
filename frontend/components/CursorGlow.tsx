"use client";
/**
 * A soft radial light that trails the cursor — scoped deliberately to the
 * login/register screens only (not sitewide), where a moment of tactile
 * flair fits. Uses a spring so the glow eases toward the pointer rather
 * than snapping to it, which is what reads as "physical" instead of
 * "attached to a div". Respects prefers-reduced-motion.
 */
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 20, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 60, damping: 20, mass: 0.6 });
  const hasMoved = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    function onMove(e: MouseEvent) {
      hasMoved.current = true;
      x.set(e.clientX);
      y.set(e.clientY);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed w-[420px] h-[420px] rounded-full -z-10 hidden md:block"
      style={{
        left: springX,
        top: springY,
        x: "-50%",
        y: "-50%",
        background:
          "radial-gradient(circle, rgba(62,134,181,0.12) 0%, rgba(62,134,181,0.04) 45%, transparent 70%)",
      }}
      aria-hidden="true"
    />
  );
}
