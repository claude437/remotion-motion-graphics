import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { ARABIC_FONT, BRAND } from "../theme";

type ComparisonBarsProps = {
  readonly base: number;
  readonly maxHeight: number;
  readonly width: number;
  readonly x5000: number;
  readonly x600: number;
  /** 0 → 1 growth of each column (springs, may overshoot a little). */
  readonly grow5000: number;
  readonly grow600: number;
  /** 0 → 1 dashed "same outcome" level line + ≈ badge. */
  readonly level: number;
  /** 0 → 1 relapse indicator tracks beneath the labels. */
  readonly relapse: number;
  readonly opacity: number;
};

/**
 * Both columns finish at ~the same outcome level on purpose: in the trial,
 * 5000 IU was not superior to 600 IU/day. No numeric outcomes are shown.
 */
export const OUTCOME_LEVEL = { d5000: 0.84, d600: 0.83 } as const;
/** Same relative fill for both relapse tracks: no difference, no invented figures. */
const RELAPSE_FILL = 0.5;

export const ComparisonBars: React.FC<ComparisonBarsProps> = ({
  base,
  maxHeight,
  width,
  x5000,
  x600,
  grow5000,
  grow600,
  level,
  relapse,
  opacity,
}) => {
  if (opacity <= 0) return null;
  const h5000 = maxHeight * OUTCOME_LEVEL.d5000 * grow5000;
  const h600 = maxHeight * OUTCOME_LEVEL.d600 * grow600;
  const levelY =
    base - (maxHeight * (OUTCOME_LEVEL.d5000 + OUTCOME_LEVEL.d600)) / 2;
  const lineLeft = x600 - width / 2 - 20;
  const lineRight = x5000 + width / 2 + 20;
  const lineDraw = interpolate(level, [0, 0.7], [0, 1], CLAMP);

  const column = (cx: number, hgt: number, fill: string) => (
    <g>
      <rect
        x={cx - width / 2}
        y={base - maxHeight}
        width={width}
        height={maxHeight}
        rx={26}
        fill={BRAND.gray}
        opacity={0.45}
      />
      {hgt > 1 ? (
        <rect
          x={cx - width / 2}
          y={base - hgt}
          width={width}
          height={hgt}
          rx={Math.min(26, hgt / 2)}
          fill={fill}
        />
      ) : null}
    </g>
  );

  const track = (cx: number) => (
    <g opacity={interpolate(relapse, [0, 0.3], [0, 1], CLAMP)}>
      <rect
        x={cx - width / 2}
        y={base + 182}
        width={width}
        height={18}
        rx={9}
        fill={BRAND.gray}
      />
      <rect
        x={cx + width / 2 - width * RELAPSE_FILL * relapse}
        y={base + 182}
        width={width * RELAPSE_FILL * relapse}
        height={18}
        rx={9}
        fill={BRAND.charcoal}
      />
    </g>
  );

  return (
    <g opacity={opacity}>
      {column(x5000, h5000, BRAND.orange)}
      {column(x600, h600, BRAND.beige)}

      {/* Same-outcome level line, drawn right → left. */}
      <line
        x1={lineRight}
        x2={lineRight - (lineRight - lineLeft) * lineDraw}
        y1={levelY}
        y2={levelY}
        stroke={BRAND.charcoal}
        strokeWidth={4}
        strokeDasharray="14 12"
        strokeLinecap="round"
      />
      <g
        transform={`translate(${(x5000 + x600) / 2} ${levelY}) scale(${interpolate(level, [0.4, 1], [0, 1], CLAMP)})`}
      >
        <circle r={40} fill={BRAND.charcoal} />
        <text
          y={17}
          textAnchor="middle"
          fontFamily={ARABIC_FONT}
          fontWeight={700}
          fontSize={50}
          fill={BRAND.offWhite}
        >
          ≈
        </text>
      </g>

      {/* Value labels: kept in Latin script, LTR, large for readability. */}
      <text
        x={x5000}
        y={base + 66}
        textAnchor="middle"
        fontFamily={ARABIC_FONT}
        fontWeight={700}
        fontSize={60}
        fill={BRAND.charcoal}
        direction="ltr"
      >
        5000 IU
      </text>
      <text
        x={x600}
        y={base + 66}
        textAnchor="middle"
        fontFamily={ARABIC_FONT}
        fontWeight={700}
        fontSize={54}
        fill={BRAND.charcoal}
        direction="ltr"
      >
        600 IU/day
      </text>

      {/* Relapse indicator: identical fill under each dose, joined by "=". */}
      {track(x5000)}
      {track(x600)}
      <text
        x={(x5000 + x600) / 2}
        y={base + 205}
        textAnchor="middle"
        fontFamily={ARABIC_FONT}
        fontWeight={700}
        fontSize={52}
        fill={BRAND.charcoal}
        opacity={interpolate(relapse, [0.5, 1], [0, 1], CLAMP)}
      >
        =
      </text>
    </g>
  );
};
