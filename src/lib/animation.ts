import { Easing, interpolate, spring, type SpringConfig } from "remotion";

/**
 * Frame-driven animation helpers. Every helper is a pure function of the
 * current frame, so output is deterministic in Studio and during rendering.
 * Never use CSS transitions/animations — they don't render.
 */

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Named easing curves for consistent motion across scenes. */
export const EASE = {
  /** Fast start, long soft landing. Default for entrances. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Slow start, fast finish. Default for exits. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** Symmetric, for moves between two resting states. */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
} as const;

/** Spring presets. `smooth` never overshoots, `bouncy` overshoots playfully. */
export const SPRINGS = {
  smooth: { damping: 200 },
  snappy: { damping: 20, stiffness: 200 },
  bouncy: { damping: 9, stiffness: 120 },
} satisfies Record<string, Partial<SpringConfig>>;

/** Converts seconds to a whole number of frames. */
export const sec = (seconds: number, fps: number) => Math.round(seconds * fps);

/** 0 → 1 progress over `[start, start + duration]` frames with easing. */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE.out,
) =>
  interpolate(frame, [start, start + duration], [0, 1], { ...CLAMP, easing });

/** 0 → 1 spring that starts at `delay` frames. */
export const springIn = ({
  frame,
  fps,
  delay = 0,
  config = SPRINGS.smooth,
  durationInFrames,
}: {
  frame: number;
  fps: number;
  delay?: number;
  config?: Partial<SpringConfig>;
  durationInFrames?: number;
}) => spring({ frame: frame - delay, fps, config, durationInFrames });

/** Delay for the n-th item of a staggered group. */
export const stagger = (index: number, step: number, offset = 0) =>
  offset + index * step;

/**
 * Fades in at the start and out at the end of a `duration`-frame window.
 * Useful for elements that should leave before their scene ends.
 */
export const fadeInOut = (
  frame: number,
  duration: number,
  fadeFrames: number,
) =>
  interpolate(
    frame,
    [0, fadeFrames, duration - fadeFrames, duration],
    [0, 1, 1, 0],
    CLAMP,
  );
