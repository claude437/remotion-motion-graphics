import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { ARABIC_FONT, BRAND } from "../../vitamin-d-ms/theme";
import { AXIS, xForIU } from "../timeline";

export const UPPER_LIMIT_IU = 4000;

type SafetyLimitPanelProps = {
  /** 0 → 1: beige "safe zone" fills from 0 up to the limit. */
  readonly zone: number;
  /** 0 → 1: dashed threshold wall rises at 4000 IU. */
  readonly wall: number;
  /** 0 → 1 flash when something touches the wall. */
  readonly hit?: number;
  readonly opacity: number;
};

/** Threshold visual: safe zone under 4000 IU/day and a clear boundary wall. */
export const SafetyLimitPanel: React.FC<SafetyLimitPanelProps> = ({
  zone,
  wall,
  hit = 0,
  opacity,
}) => {
  if (opacity <= 0) return null;
  const wx = xForIU(UPPER_LIMIT_IU);
  const top = AXIS.y - 150;
  const wallTop = AXIS.y + 40 - (AXIS.y + 40 - top) * wall;
  return (
    <g opacity={opacity}>
      {zone > 0 ? (
        <rect
          x={AXIS.x0 - 10}
          y={AXIS.y - 30}
          width={(wx - AXIS.x0 + 10) * zone}
          height={60}
          rx={14}
          fill={BRAND.beige}
          opacity={0.75}
        />
      ) : null}
      {wall > 0 ? (
        <g>
          <line
            x1={wx}
            x2={wx}
            y1={AXIS.y + 40}
            y2={wallTop}
            stroke={BRAND.charcoal}
            strokeWidth={6 + 4 * hit}
            strokeDasharray="14 10"
            strokeLinecap="round"
          />
          <g
            transform={`translate(${wx} ${wallTop - 34}) scale(${interpolate(wall, [0.6, 1], [0, 1], CLAMP) * (1 + 0.15 * hit)})`}
          >
            <rect
              x={-62}
              y={-30}
              width={124}
              height={56}
              rx={28}
              fill={BRAND.charcoal}
            />
            <text
              y={12}
              textAnchor="middle"
              direction="ltr"
              fontFamily={ARABIC_FONT}
              fontWeight={700}
              fontSize={34}
              fill={BRAND.offWhite}
            >
              4000
            </text>
          </g>
          {hit > 0 ? (
            <circle
              cx={wx}
              cy={AXIS.y}
              r={30 + 60 * hit}
              fill="none"
              stroke={BRAND.orange}
              strokeWidth={5}
              opacity={1 - hit}
            />
          ) : null}
        </g>
      ) : null}
    </g>
  );
};
