import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#EEF3F7",
        surface: "#FFFFFF",
        border: "#DCE6EE",
        ink: {
          DEFAULT: "#16232F",
          muted: "#5B6B78",
          faint: "#8FA0AC",
        },
        // Primary: deep serenity blue — replaces the earlier teal.
        accent: {
          DEFAULT: "#1F5275",
          strong: "#123A56",
          soft: "#DCEAF4",
        },
        // Secondary: healing green — active/success states only, never the
        // dominant color, so it reads as an organic accent against blue.
        healing: {
          DEFAULT: "#2E7953",
          soft: "#DFF0E5",
        },
        // Rare warm accent — used sparingly (one detail per screen at most)
        // for genuinely important moments, per the "unexpected contrast"
        // principle: deep blue environment + small golden highlight.
        gold: {
          DEFAULT: "#C99A3D",
          soft: "#F7EED9",
        },
        status: {
          warn: "#B5672A",
          warnSoft: "#F5E9DD",
          danger: "#B23B3B",
          dangerSoft: "#F6E6E6",
          ok: "#2E7953",
          okSoft: "#DFF0E5",
        },
        // Landing-page-only dark palette — namespaced under "night" so it
        // never collides with or accidentally leaks into the app's light
        // clinical theme used on every authenticated screen.
        night: {
          base: "#071A2B",
          deep: "#0B1120",
          surface: "rgba(255,255,255,0.05)",
          surfaceStrong: "rgba(255,255,255,0.09)",
          border: "rgba(255,255,255,0.10)",
          text: "#E8F7FA",
          textMuted: "#9FB4C4",
        },
        ocean: "#087EA4",
        cyan: "#67E8F9",
        teal: "#12B8A6",
        emerald: "#22C55E",
        violet: "#A78BFA",
        coral: "#FB7185",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
        grotesk: ["Space Grotesk", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,33,29,0.04), 0 1px 1px rgba(20,33,29,0.03)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
export default config;
