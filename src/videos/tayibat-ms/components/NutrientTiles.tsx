import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { rrPath } from "../shapes";
import { BRAND, CAIRO } from "../theme";

export const tilePath = (x: number, y: number, size: number) =>
  rrPath(x, y, size, size, 30);

type TileProps = {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly label: string;
  /** Filled (present) or dashed (possibly missing). */
  readonly filled: boolean;
  readonly opacity: number;
  /** 0 → 1 label fade. */
  readonly labelOpacity?: number;
};

/** One nutrient tile. A missing tile stays as a dashed outline with a faint label. */
export const NutrientTile: React.FC<TileProps> = ({
  x,
  y,
  size,
  label,
  filled,
  opacity,
  labelOpacity = 1,
}) => {
  if (opacity <= 0) return null;
  const isArabic = /[؀-ۿ]/.test(label);
  return (
    <g opacity={opacity}>
      <path
        d={tilePath(x, y, size)}
        fill={filled ? BRAND.offWhite : "none"}
        stroke={BRAND.charcoal}
        strokeWidth={filled ? 6 : 5}
        strokeDasharray={filled ? undefined : "12 10"}
        opacity={filled ? 1 : 0.7}
        filter={filled ? "url(#tay-shadow)" : undefined}
      />
      <text
        x={x}
        y={y + (isArabic ? 18 : 20)}
        textAnchor="middle"
        direction={isArabic ? "rtl" : "ltr"}
        fontFamily={CAIRO}
        fontWeight={800}
        fontSize={isArabic ? 48 : 60}
        fill={BRAND.charcoal}
        opacity={(filled ? 1 : 0.35) * labelOpacity}
      >
        {label}
      </text>
    </g>
  );
};

/** Battery: `level` 0 → 1 fills four cells; low levels use the accent orange. */
export const Battery: React.FC<{
  x: number;
  y: number;
  level: number;
  scale?: number;
  opacity?: number;
}> = ({ x, y, level, scale = 1, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const cells = 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <rect
        x={-80}
        y={-44}
        width={160}
        height={88}
        rx={20}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={7}
      />
      <rect
        x={82}
        y={-18}
        width={16}
        height={36}
        rx={5}
        fill={BRAND.charcoal}
      />
      {Array.from({ length: cells }, (_, i) => {
        const on = interpolate(level * cells, [i, i + 1], [0, 1], CLAMP);
        if (on <= 0) return null;
        return (
          <rect
            key={i}
            x={-64 + i * 34}
            y={-28}
            width={28 * on}
            height={56}
            rx={6}
            fill={level < 0.35 ? BRAND.orange : BRAND.charcoal}
          />
        );
      })}
    </g>
  );
};

/**
 * Simple bowel icon (a looped tube). `unease` adds a small, faster wobble and
 * two discomfort ticks; calm is a slow gentle sway. Not anatomical, not graphic.
 */
export const BowelIcon: React.FC<{
  x: number;
  y: number;
  unease: number;
  sec: number;
  scale?: number;
  opacity?: number;
}> = ({ x, y, unease, sec, scale = 1, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const wob = Math.sin(sec * (2 + 9 * unease)) * (1.2 + 3 * unease);
  const tube = `M -60 -46 C -20 ${-62 + wob} 30 ${-62 - wob} 58 -40 C 80 -20 50 -6 20 -10 C -20 ${-14 + wob} -60 -4 -60 18 C -60 40 -20 ${42 - wob} 20 36 C 50 32 64 44 56 62`;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <circle
        r={96}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={6}
      />
      <path
        d={tube}
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={30}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={tube}
        fill="none"
        stroke={BRAND.beige}
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {unease > 0.05 ? (
        <g
          opacity={unease}
          stroke={BRAND.orange}
          strokeWidth={7}
          strokeLinecap="round"
        >
          <line x1={74} y1={-74} x2={88} y2={-90} />
          <line x1={86} y1={-60} x2={104} y2={-66} />
        </g>
      ) : null}
    </g>
  );
};

/** Heat symbol: thermometer with rising heat waves (warm weather → drink more). */
export const HeatIcon: React.FC<{
  x: number;
  y: number;
  p: number;
  sec: number;
}> = ({ x, y, p, sec }) => {
  if (p <= 0) return null;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${interpolate(p, [0, 1], [0.6, 1])})`}
      opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP)}
    >
      <rect
        x={-16}
        y={-70}
        width={32}
        height={100}
        rx={16}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={6}
      />
      <circle
        cx={0}
        cy={44}
        r={26}
        fill={BRAND.orange}
        stroke={BRAND.charcoal}
        strokeWidth={6}
      />
      <rect x={-6} y={-30} width={12} height={60} rx={6} fill={BRAND.orange} />
      {[0, 1, 2].map((i) => {
        const dy = -((sec * 30 + i * 22) % 40);
        return (
          <path
            key={i}
            d={`M ${44 + i * 22} ${30 + dy} c 8 -10 -8 -20 0 -30 c 8 -10 -8 -20 0 -30`}
            fill="none"
            stroke={BRAND.offWhite}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.85}
          />
        );
      })}
    </g>
  );
};

/** Dietitian checklist card: rows tick in order. The title is HTML (Arabic). */
export const Checklist: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
  ticks: number;
}> = ({ x, y, w, h, p, ticks }) => {
  if (p <= 0) return null;
  const rows = 4;
  return (
    <g
      transform={`translate(0 ${interpolate(p, [0, 1], [40, 0])})`}
      opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP)}
    >
      <path
        d={rrPath(x, y, w, h, 28)}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={6}
        filter="url(#tay-shadow)"
      />
      <rect
        x={x - 36}
        y={y - h / 2 - 16}
        width={72}
        height={30}
        rx={10}
        fill={BRAND.charcoal}
      />
      {Array.from({ length: rows }, (_, i) => {
        const ry = y - h / 2 + 108 + i * 52;
        const t = interpolate(ticks * rows, [i, i + 0.8], [0, 1], CLAMP);
        const bx = x + w / 2 - 50;
        return (
          <g key={i}>
            <rect
              x={bx - 16}
              y={ry - 16}
              width={32}
              height={32}
              rx={8}
              fill={t > 0.5 ? BRAND.charcoal : BRAND.offWhite}
              stroke={BRAND.charcoal}
              strokeWidth={4}
            />
            {t > 0 ? (
              <path
                d={`M ${bx - 8} ${ry} L ${bx - 2} ${ry + 7} L ${bx + 9} ${ry - 7}`}
                fill="none"
                stroke={BRAND.orangeBright}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={t}
              />
            ) : null}
            <rect
              x={x - w / 2 + 28}
              y={ry - 6}
              width={[130, 110, 140, 96][i]}
              height={12}
              rx={6}
              fill={BRAND.gray}
            />
          </g>
        );
      })}
    </g>
  );
};
