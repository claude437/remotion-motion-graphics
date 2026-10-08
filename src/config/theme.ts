import { FONT_FAMILY } from "../lib/fonts";

/** Shared colors and typography. Keep visual decisions here so scenes stay consistent. */
export const THEME = {
  colors: {
    background: "#0B0D17",
    backgroundAlt: "#141832",
    text: "#F5F7FF",
    textMuted: "#A9B0D6",
    primary: "#6C63FF",
    secondary: "#00D1B2",
    accent: "#FF6B8B",
    highlight: "#FFC857",
  },
  font: {
    family: FONT_FAMILY,
    /** Rough minimum sizes for a 1920px wide frame (see AGENTS.md). */
    headline: 132,
    title: 84,
    body: 44,
    caption: 32,
  },
  /** Keep key content inside this inset from the frame edges. */
  safeArea: { x: 120, y: 100 },
  radius: 32,
} as const;
