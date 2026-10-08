import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { ARABIC_FONT, BRAND } from "../../vitamin-d-ms/theme";

type CalciumIndicatorProps = {
  readonly x: number;
  readonly y: number;
  /** 0 → 1 tile entrance. */
  readonly progress: number;
  /** 0 → 1 the "rising" arrow grows and the level bar climbs. */
  readonly rise: number;
  readonly opacity?: number;
};

/** Periodic-table style "Ca" tile with a gentle upward arrow: calcium rising. */
export const CalciumIndicator: React.FC<CalciumIndicatorProps> = ({
  x,
  y,
  progress,
  rise,
  opacity = 1,
}) => {
  if (progress <= 0 || opacity <= 0) return null;
  const arrowH = 120 * rise;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${interpolate(progress, [0, 1], [0.7, 1])})`}
      opacity={interpolate(progress, [0, 0.4], [0, 1], CLAMP) * opacity}
    >
      <rect
        x={-80}
        y={-80}
        width={160}
        height={160}
        rx={26}
        fill={BRAND.charcoal}
      />
      <text
        x={-56}
        y={-44}
        fontFamily={ARABIC_FONT}
        fontWeight={600}
        fontSize={26}
        fill={BRAND.gray}
      >
        20
      </text>
      <text
        y={38}
        textAnchor="middle"
        direction="ltr"
        fontFamily={ARABIC_FONT}
        fontWeight={700}
        fontSize={84}
        fill={BRAND.offWhite}
      >
        Ca
      </text>
      {/* Level bar inside the tile edge */}
      <rect
        x={58}
        y={-60}
        width={10}
        height={120}
        rx={5}
        fill={BRAND.gray}
        opacity={0.35}
      />
      <rect
        x={58}
        y={60 - 120 * (0.35 + 0.5 * rise)}
        width={10}
        height={120 * (0.35 + 0.5 * rise)}
        rx={5}
        fill={BRAND.orangeBright}
      />
      {arrowH > 2 ? (
        <g transform="translate(130 60)">
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={-arrowH}
            stroke={BRAND.orange}
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d={`M -26 ${-arrowH + 24} L 0 ${-arrowH - 4} L 26 ${-arrowH + 24}`}
            fill="none"
            stroke={BRAND.orange}
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : null}
    </g>
  );
};

type KidneyWarningProps = {
  readonly x: number;
  readonly y: number;
  readonly variant: "stones" | "warning";
  /** 0 → 1 entrance. */
  readonly progress: number;
  /** Seconds, drives the tiny moving stone / gentle badge pulse. */
  readonly sec: number;
  readonly opacity?: number;
};

const KIDNEY =
  "M 10 -92 C 70 -100 104 -40 98 10 C 92 66 52 104 4 96 C -38 90 -46 52 -24 30 C -10 16 -14 -16 -30 -28 C -52 -46 -48 -86 10 -92 Z";

/**
 * Calm, diagrammatic kidney caution icons: "stones" shows a few small
 * calculi, "warning" adds a caution badge. Not graphic or alarming.
 */
export const KidneyWarning: React.FC<KidneyWarningProps> = ({
  x,
  y,
  variant,
  progress,
  sec,
  opacity = 1,
}) => {
  if (progress <= 0 || opacity <= 0) return null;
  const pulse =
    variant === "warning" ? 1 + 0.06 * Math.max(0, Math.sin(sec * 5)) : 1;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${interpolate(progress, [0, 1], [0.7, 1])})`}
      opacity={interpolate(progress, [0, 0.4], [0, 1], CLAMP) * opacity}
    >
      {/* ureter */}
      <path
        d="M -26 30 C -40 60 -40 100 -30 130"
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d={KIDNEY}
        fill={BRAND.beige}
        stroke={BRAND.charcoal}
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <path
        d="M 30 -50 C 60 -30 64 20 40 50"
        fill="none"
        stroke={BRAND.offWhite}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.8}
      />
      {variant === "stones" ? (
        <g>
          {[
            [40, 40, 11],
            [62, 18, 8],
            [24, 62, 7],
          ].map(([sx, sy, r], i) => (
            <path
              key={i}
              d={`M ${sx - r} ${sy} L ${sx - r * 0.4} ${sy - r} L ${sx + r * 0.7} ${sy - r * 0.8} L ${sx + r} ${sy + r * 0.2} L ${sx + r * 0.2} ${sy + r} L ${sx - r * 0.8} ${sy + r * 0.7} Z`}
              fill={BRAND.charcoal}
            />
          ))}
          {/* one small stone drifting down the ureter */}
          <circle
            cx={-34}
            cy={50 + ((sec * 30) % 70)}
            r={6}
            fill={BRAND.charcoal}
            opacity={0.8}
          />
        </g>
      ) : (
        <g transform={`translate(70 -70) scale(${pulse})`}>
          <path
            d="M 0 -40 L 40 30 L -40 30 Z"
            fill={BRAND.orange}
            stroke={BRAND.charcoal}
            strokeWidth={7}
            strokeLinejoin="round"
          />
          <line
            x1={0}
            y1={-14}
            x2={0}
            y2={8}
            stroke={BRAND.charcoal}
            strokeWidth={7}
            strokeLinecap="round"
          />
          <circle cx={0} cy={20} r={4.5} fill={BRAND.charcoal} />
        </g>
      )}
    </g>
  );
};
