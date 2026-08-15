"use client";
/**
 * Layered synthesized sound-effect system — Web Audio API, no audio files.
 * Each interaction type has its own tonal character (not one reused chime),
 * with slight pitch randomization so repeated actions don't feel mechanical.
 * Kept short, soft, and low-volume — this is a clinical product, sound
 * should read as quiet confirmation, never as a game/toy.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function jitter(base: number, amount = 0.03): number {
  return base * (1 + (Math.random() * 2 - 1) * amount);
}

function tone(freq: number, startOffset: number, duration: number, gain: number, type: OscillatorType = "sine") {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = jitter(freq);
  const now = audioCtx.currentTime + startOffset;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(gain, now + 0.012);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Very short filtered noise burst — used for tactile "press" feedback */
function noiseBurst(duration: number, gain: number, filterFreq: number) {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const bufferSize = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = 1.2;
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = gain;
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start();
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("medtrace_sound") === "on";
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("medtrace_sound", enabled ? "on" : "off");
}

function play(fn: () => void) {
  if (!isSoundEnabled()) return;
  try {
    fn();
  } catch {
    // Fail silently — sound is a nice-to-have, never blocks the action.
  }
}

/** Soft tactile press — button clicks, general interaction */
export function playClick() {
  play(() => {
    noiseBurst(0.02, 0.04, 2400);
    tone(720, 0, 0.05, 0.02, "triangle");
  });
}

/** Distinct from click — a quieter, higher "tick" for nav/tab changes */
export function playNav() {
  play(() => {
    tone(1100, 0, 0.045, 0.018, "sine");
  });
}

/** Two-note ascending resolve — success (upload processed, message sent, login) */
export function playSuccess() {
  play(() => {
    tone(523.25, 0, 0.16, 0.045, "sine");
    tone(783.99, 0.08, 0.24, 0.04, "sine");
  });
}

/** Low, brief, non-alarming — error / failed state */
export function playError() {
  play(() => {
    tone(196, 0, 0.22, 0.035, "sine");
    tone(174.61, 0.05, 0.2, 0.025, "sine");
  });
}

/** Small mechanical detent — toggles (sound on/off itself, filters) */
export function playToggle() {
  play(() => {
    noiseBurst(0.015, 0.03, 3200);
  });
}
