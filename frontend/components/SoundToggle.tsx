"use client";
import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundEnabled, setSoundEnabled, playToggle } from "@/lib/sound";

export default function SoundToggle({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  function toggle() {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
    if (next) playToggle(); // audible confirmation only when turning ON
  }

  return (
    <button
      onClick={toggle}
      title={enabled ? "Sound effects on" : "Sound effects off"}
      className={`flex items-center gap-1.5 text-ink-muted hover:text-accent transition-colors bg-surface border border-border rounded-full px-3 py-1.5 shadow-card ${className}`}
    >
      {enabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
      <span className="text-xs font-medium">{enabled ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
