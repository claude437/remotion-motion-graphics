import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { ARABIC_FONT, BRAND } from "../../vitamin-d-ms/theme";
import { AXIS, xForIU } from "../timeline";

type BigValueProps = {
  readonly x: number;
  readonly y: number;
  readonly value: string;
  readonly unit: string;
  /** Small Latin caption above the value (letter-spaced). */
  readonly caption?: string;
  /** 0 → 1 entrance; values are LTR Latin tokens for readability. */
  readonly progress: number;
  /** 0 → 1 exit (lifts and fades). */
  readonly exit?: number;
};

/** Large dosage value + unit, as used on the dose, limit and summary cards. */
export const BigValue: React.FC<BigValueProps> = ({
  x,
  y,
  value,
  unit,
  caption,
  progress,
  exit = 0,
}) => {
  const o = interpolate(progress, [0, 0.5], [0, 1], CLAMP) * (1 - exit);
  if (o <= 0) return null;
  const dy = interpolate(progress, [0, 1], [40, 0]) - 50 * exit;
  return (
    <g opacity={o} transform={`translate(0 ${dy})`}>
      {caption ? (
        <text
          x={x}
          y={y - 128}
          textAnchor="middle"
          direction="ltr"
          fontFamily={ARABIC_FONT}
          fontWeight={600}
          fontSize={28}
          letterSpacing={6}
          fill={BRAND.charcoal}
          opacity={0.6}
        >
          {caption}
        </text>
      ) : null}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        direction="ltr"
        fontFamily={ARABIC_FONT}
        fontWeight={700}
        fontSize={150}
        fill={BRAND.charcoal}
      >
        {value}
      </text>
      <text
        x={x}
        y={y + 76}
        textAnchor="middle"
        direction="ltr"
        fontFamily={ARABIC_FONT}
        fontWeight={700}
        fontSize={60}
        fill={BRAND.orange}
      >
        {unit}
      </text>
    </g>
  );
};

type DoseCardProps = {
  /** 0 → 1: axis decorations (zero tick + arrowhead). */
  readonly axis: number;
  /** 0 → 1: highlight of the 600–800 IU daily range on the axis. */
  readonly range: number;
  readonly opacity: number;
};

/**
 * Daily requirement on the dose axis: the usual adult 600–800 IU/day range
 * highlighted on a linear 0–5000 IU scale. The big value is a separate BigValue.
 */
export const DoseCard: React.FC<DoseCardProps> = ({ axis, range, opacity }) => {
  if (opacity <= 0) return null;
  const a = xForIU(600);
  const b = xForIU(800);
  return (
    <g opacity={opacity}>
      <g opacity={axis}>
        <text
          x={AXIS.x0}
          y={AXIS.y + 56}
          textAnchor="middle"
          fontFamily={ARABIC_FONT}
          fontWeight={600}
          fontSize={30}
          fill={BRAND.charcoal}
          opacity={0.6}
        >
          0
        </text>
        <path
          d={`M ${AXIS.x1 + 6} ${AXIS.y - 14} L ${AXIS.x1 + 26} ${AXIS.y} L ${AXIS.x1 + 6} ${AXIS.y + 14}`}
          fill="none"
          stroke={BRAND.charcoal}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={AXIS.x1}
          y={AXIS.y + 56}
          textAnchor="end"
          direction="ltr"
          fontFamily={ARABIC_FONT}
          fontWeight={600}
          fontSize={26}
          fill={BRAND.charcoal}
          opacity={0.5}
        >
          IU/day
        </text>
      </g>
      {range > 0 ? (
        <g opacity={interpolate(range, [0, 0.3], [0, 1], CLAMP)}>
          <rect
            x={a - 10}
            y={AXIS.y - 22}
            width={(b - a + 20) * range}
            height={44}
            rx={22}
            fill={BRAND.orange}
          />
          <path
            d={`M ${a - 8} ${AXIS.y + 34} L ${a - 8} ${AXIS.y + 44} L ${b + 8} ${AXIS.y + 44} L ${b + 8} ${AXIS.y + 34}`}
            fill="none"
            stroke={BRAND.charcoal}
            strokeWidth={4}
            opacity={range}
          />
          <text
            x={(a + b) / 2}
            y={AXIS.y + 82}
            textAnchor="middle"
            direction="ltr"
            fontFamily={ARABIC_FONT}
            fontWeight={700}
            fontSize={30}
            fill={BRAND.charcoal}
            opacity={interpolate(range, [0.5, 1], [0, 1], CLAMP)}
          >
            600–800
          </text>
        </g>
      ) : null}
    </g>
  );
};
