import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { LAYOUT } from "../timeline";
import { BRAND } from "../theme";

const { left, right, top, bottom } = LAYOUT.graph;
const W = right - left;
const STEPS = 160;

/**
 * Both lines run right → left (RTL time axis). Vitamin D level trends down,
 * the abstract MS-activity signal trends up. Shapes are illustrative only:
 * no axis values, so nothing implies a measured effect size.
 */
const polyline = (fn: (t: number) => number) =>
  Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS;
    return `${i === 0 ? "M" : "L"} ${(right - t * W).toFixed(1)} ${fn(t).toFixed(1)}`;
  }).join(" ");

export const VITAMIN_D_LINE = polyline(
  (t) => top + 50 + t * 390 + Math.sin(t * 8) * 14,
);
// Abstract activity signal: a smooth wave whose amplitude grows as it rises.
export const MS_LINE = polyline(
  (t) => bottom - 70 - t * 400 + Math.sin(t * Math.PI * 2 * 6) * (5 + 18 * t),
);

const VD_LENGTH = getLength(VITAMIN_D_LINE);
const MS_LENGTH = getLength(MS_LINE);

const clamp01 = (p: number) => Math.min(1, Math.max(0, p));
const pointOn = (path: string, length: number, p: number) =>
  getPointAtLength(path, length * clamp01(p)) ?? { x: right, y: bottom };

export const pointOnVitaminD = (p: number) =>
  pointOn(VITAMIN_D_LINE, VD_LENGTH, p);
export const pointOnMS = (p: number) => pointOn(MS_LINE, MS_LENGTH, p);

/** Fractions along the MS line where data dots sit (they later become immune cells). */
export const DOT_FRACTIONS = [0.06, 0.2, 0.34, 0.48, 0.62, 0.78, 0.94] as const;

type AssociationGraphProps = {
  /** 0 → 1 vertical axis draw. */
  readonly axis: number;
  /** 0 → 1 line drawing. */
  readonly draw: number;
  readonly opacity: number;
};

/** Y-axis and the two trend lines. The x-axis is the flattened nerve itself. */
export const AssociationGraph: React.FC<AssociationGraphProps> = ({
  axis,
  draw,
  opacity,
}) => {
  if (opacity <= 0) return null;
  const vd = evolvePath(draw, VITAMIN_D_LINE);
  const ms = evolvePath(draw, MS_LINE);
  return (
    <g opacity={opacity}>
      <line
        x1={right}
        x2={right}
        y1={bottom}
        y2={bottom - (bottom - top) * axis}
        stroke={BRAND.charcoal}
        strokeWidth={7}
        strokeLinecap="round"
      />
      {/* Light guide lines */}
      {[0.33, 0.66].map((f) => (
        <line
          key={f}
          x1={right}
          x2={right - W * interpolate(axis, [0.3, 1], [0, 1], CLAMP)}
          y1={bottom - (bottom - top) * f}
          y2={bottom - (bottom - top) * f}
          stroke={BRAND.charcoal}
          strokeOpacity={0.12}
          strokeWidth={3}
        />
      ))}
      <path
        d={MS_LINE}
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={7}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={ms.strokeDasharray}
        strokeDashoffset={ms.strokeDashoffset}
      />
      <path
        d={VITAMIN_D_LINE}
        fill="none"
        stroke={BRAND.offWhite}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={vd.strokeDasharray}
        strokeDashoffset={vd.strokeDashoffset}
      />
    </g>
  );
};
