import React from "react";
import { AbsoluteFill, random } from "remotion";
import { track } from "../../../lib/animation";
import { SCENES } from "../timeline";
import { BRAND } from "../theme";

type BrandBackgroundProps = {
  readonly frame: number;
  readonly fps: number;
  readonly width: number;
  readonly height: number;
  /** [seconds, y] keyframes for the blob's vertical focus. Defaults to Part 1. */
  readonly focus?: ReadonlyArray<readonly [number, number]>;
  /** Seconds at which the blob settles into its next shape. Defaults to Part 1's scenes. */
  readonly morphTimes?: readonly number[];
};

const BLOB_POINTS = 10;
// Radius multipliers per scene; the blob morphs smoothly between them.
const BLOB_SHAPES: readonly (readonly number[])[] = [
  [1, 0.92, 1.05, 0.95, 1.08, 0.9, 1.02, 0.96, 1.06, 0.93],
  [1.08, 0.9, 0.96, 1.1, 0.92, 1.04, 0.9, 1.08, 0.95, 1],
  [0.95, 1.06, 0.92, 1, 1.1, 0.94, 1.05, 0.9, 1.02, 1.07],
  [1.04, 0.96, 1.08, 0.92, 1, 1.06, 0.94, 1.03, 0.9, 1.05],
  [0.92, 1.05, 1, 1.08, 0.94, 1, 1.07, 0.93, 1.04, 0.97],
  [1, 0.95, 1.04, 0.97, 1.06, 0.92, 1.03, 0.98, 1.05, 0.94],
];
const SCENE_STARTS = Object.values(SCENES).map((s) => s.start);
const PART1_FOCUS: ReadonlyArray<readonly [number, number]> = [
  [0, 860],
  [SCENES.association.start + 0.5, 960],
  [SCENES.immune.start + 0.5, 1000],
  [SCENES.mri.start + 0.5, 900],
  [SCENES.dose.start + 0.5, 990],
  [16, 1020],
];
const PART1_MORPHS = SCENE_STARTS.map((s) => s + 0.6);

/** Catmull-Rom closed curve through points, as a cubic Bézier path. */
const closedCurve = (pts: readonly [number, number][]) => {
  const n = pts.length;
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

const PARTICLES = Array.from({ length: 34 }, (_, i) => ({
  x: random(`px-${i}`),
  y: random(`py-${i}`),
  r: 2 + random(`pr-${i}`) * 4,
  speed: 12 + random(`ps-${i}`) * 26,
  sway: random(`pw-${i}`) * Math.PI * 2,
  alpha: 0.18 + random(`pa-${i}`) * 0.3,
}));

/**
 * Warm orange field with a slowly morphing darker-orange blob behind the
 * content, a soft light falloff and drifting off-white particles.
 */
export const BrandBackground: React.FC<BrandBackgroundProps> = ({
  frame,
  fps,
  width,
  height,
  focus = PART1_FOCUS,
  morphTimes = PART1_MORPHS,
}) => {
  const t = frame / fps;
  const cx = width / 2;
  const cy = track(frame, fps, focus);
  const radius = 470 + Math.sin(t * 0.9) * 14;
  const pts = Array.from({ length: BLOB_POINTS }, (_, i) => {
    const m = track(
      frame,
      fps,
      morphTimes.map(
        (s, k) => [s, BLOB_SHAPES[k % BLOB_SHAPES.length][i]] as const,
      ),
    );
    const wobble = 1 + Math.sin(t * 1.1 + i * 1.7) * 0.02;
    const a = (i / BLOB_POINTS) * Math.PI * 2 + t * 0.05;
    return [
      cx + Math.cos(a) * radius * m * wobble,
      cy + Math.sin(a) * radius * 1.15 * m * wobble,
    ] as [number, number];
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${BRAND.orangeBright} 0%, ${BRAND.orange} 55%, ${BRAND.orangeDeep} 100%)`,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute" }}
      >
        <defs>
          <radialGradient id="blob-fill" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={BRAND.orangeDeep} stopOpacity={0.55} />
            <stop
              offset="100%"
              stopColor={BRAND.orangeDeep}
              stopOpacity={0.15}
            />
          </radialGradient>
        </defs>
        <path d={closedCurve(pts)} fill="url(#blob-fill)" />
        {/* Faint measurement grid lines: "scientific surface". */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={0}
            x2={width}
            y1={height * f}
            y2={height * f}
            stroke={BRAND.offWhite}
            strokeOpacity={0.05}
            strokeWidth={2}
          />
        ))}
        {PARTICLES.map((p, i) => {
          const y = (((p.y * height - t * p.speed) % height) + height) % height;
          const x = p.x * width + Math.sin(t * 0.6 + p.sway) * 14;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={p.r}
              fill={BRAND.offWhite}
              opacity={p.alpha}
            />
          );
        })}
      </svg>
      {/* Gentle vignette in a darker orange keeps the eye centered. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 65% at 50% 48%, transparent 60%, ${BRAND.orangeShadow}88 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
