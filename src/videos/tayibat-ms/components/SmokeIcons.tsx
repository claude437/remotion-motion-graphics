import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { BRAND } from "../theme";

/**
 * Smoke curl as a sinuous path from (x0, y0) to (x1, y1). `phase` animates the
 * curls so smoke drifts without randomness.
 */
export const smokePath = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  phase: number,
  amp = 26,
) => {
  const steps = 28;
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const nx = -(y1 - y0);
    const ny = x1 - x0;
    const len = Math.hypot(nx, ny) || 1;
    const w = Math.sin(t * Math.PI * 3 + phase) * amp * Math.sin(t * Math.PI);
    return [
      x0 + (x1 - x0) * t + (nx / len) * w,
      y0 + (y1 - y0) * t + (ny / len) * w,
    ];
  });
  return pts
    .map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
};

/** A soft smoke ribbon: a wide translucent gray stroke under a thinner off-white one. */
export const SmokeRibbon: React.FC<{
  d: string;
  draw: number;
  opacity: number;
  width?: number;
}> = ({ d, draw, opacity, width = 18 }) => {
  if (opacity <= 0 || draw <= 0) return null;
  const e = evolvePath(Math.min(1, draw), d);
  return (
    <g opacity={opacity}>
      <path
        d={d}
        fill="none"
        stroke={BRAND.gray}
        strokeWidth={width}
        strokeLinecap="round"
        strokeOpacity={0.55}
        strokeDasharray={e.strokeDasharray}
        strokeDashoffset={e.strokeDashoffset}
      />
      <path
        d={d}
        fill="none"
        stroke={BRAND.offWhite}
        strokeWidth={width * 0.4}
        strokeLinecap="round"
        strokeOpacity={0.8}
        strokeDasharray={e.strokeDasharray}
        strokeDashoffset={e.strokeDashoffset}
      />
    </g>
  );
};

const CIGARETTE = "M -130 -16 L 130 -16 L 130 16 L -130 16 Z";

/** Cigarette line icon; `draw` traces its outline as it forms from the smoke. */
export const Cigarette: React.FC<{
  x: number;
  y: number;
  draw: number;
  opacity?: number;
}> = ({ x, y, draw, opacity = 1 }) => {
  if (draw <= 0 || opacity <= 0) return null;
  const e = evolvePath(interpolate(draw, [0, 0.7], [0, 1], CLAMP), CIGARETTE);
  const fill = interpolate(draw, [0.5, 1], [0, 1], CLAMP);
  return (
    <g transform={`translate(${x} ${y}) rotate(-12)`} opacity={opacity}>
      <g opacity={fill}>
        <rect x={-130} y={-16} width={260} height={32} fill={BRAND.offWhite} />
        <rect x={-130} y={-16} width={78} height={32} fill={BRAND.beige} />
        <rect
          x={118}
          y={-16}
          width={12}
          height={32}
          fill={BRAND.orangeBright}
        />
        {[-110, -90, -70].map((dx) => (
          <circle
            key={dx}
            cx={dx}
            cy={0}
            r={3}
            fill={BRAND.charcoal}
            opacity={0.4}
          />
        ))}
      </g>
      <path
        d={CIGARETTE}
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={6}
        strokeLinejoin="round"
        strokeDasharray={e.strokeDasharray}
        strokeDashoffset={e.strokeDashoffset}
      />
    </g>
  );
};

const SHISHA_PARTS = [
  // base vase
  "M -62 150 C -96 150 -100 70 -40 54 L -18 20 L 18 20 L 40 54 C 100 70 96 150 62 150 Z",
  // stem
  "M 0 20 L 0 -86",
  // tray
  "M -54 -86 L 54 -86",
  // bowl
  "M -28 -88 L -20 -126 L 20 -126 L 28 -88",
  // hose
  "M 40 80 C 120 70 130 -10 92 -40",
];

/** Shisha (water pipe) line icon that traces in part by part. */
export const Shisha: React.FC<{
  x: number;
  y: number;
  draw: number;
  opacity?: number;
}> = ({ x, y, draw, opacity = 1 }) => {
  if (draw <= 0 || opacity <= 0) return null;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <path
        d={SHISHA_PARTS[0]}
        fill={BRAND.offWhite}
        opacity={interpolate(draw, [0.5, 1], [0, 1], CLAMP)}
      />
      {SHISHA_PARTS.map((d, i) => {
        const e = evolvePath(
          interpolate(draw, [i * 0.12, 0.5 + i * 0.1], [0, 1], CLAMP),
          d,
        );
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={BRAND.charcoal}
            strokeWidth={i === 4 ? 7 : 8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={e.strokeDasharray}
            strokeDashoffset={e.strokeDashoffset}
          />
        );
      })}
      <circle
        cx={92}
        cy={-44}
        r={8 * interpolate(draw, [0.8, 1], [0, 1], CLAMP)}
        fill={BRAND.charcoal}
      />
    </g>
  );
};

/** Charcoal prohibition stroke drawn diagonally across the smoking icons. */
export const ProhibitionStroke: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  draw: number;
}> = ({ x1, y1, x2, y2, draw }) => {
  if (draw <= 0) return null;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x1 + (x2 - x1) * draw}
        y2={y1 + (y2 - y1) * draw}
        stroke={BRAND.offWhite}
        strokeWidth={34}
        strokeLinecap="round"
        opacity={0.9}
      />
      <line
        x1={x1}
        y1={y1}
        x2={x1 + (x2 - x1) * draw}
        y2={y1 + (y2 - y1) * draw}
        stroke={BRAND.charcoal}
        strokeWidth={20}
        strokeLinecap="round"
      />
    </g>
  );
};
