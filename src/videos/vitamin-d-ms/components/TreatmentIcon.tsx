import React from "react";
import { BRAND } from "../theme";

type TreatmentIconProps = {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly opacity: number;
};

/**
 * Standard MS treatment: a large two-tone capsule in front of a protective
 * shield outline. Abstract on purpose: no specific drug is implied.
 */
export const TreatmentIcon: React.FC<TreatmentIconProps> = ({
  x,
  y,
  scale,
  opacity,
}) => {
  if (opacity <= 0 || scale <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <path
        d="M 0 -150 C 60 -128 110 -118 140 -118 C 140 10 100 110 0 160 C -100 110 -140 10 -140 -118 C -110 -118 -60 -128 0 -150 Z"
        fill="none"
        stroke={BRAND.gray}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      <g transform="rotate(-40)">
        <rect
          x={-120}
          y={-46}
          width={240}
          height={92}
          rx={46}
          fill={BRAND.offWhite}
          stroke={BRAND.charcoal}
          strokeWidth={9}
        />
        <path
          d="M 0 -46 L -74 -46 A 46 46 0 0 0 -74 46 L 0 46 Z"
          fill={BRAND.charcoal}
        />
        <path
          d="M 0 -46 L 74 -46 A 46 46 0 0 1 74 46 L 0 46 Z"
          fill={BRAND.orange}
        />
        <rect
          x={-120}
          y={-46}
          width={240}
          height={92}
          rx={46}
          fill="none"
          stroke={BRAND.charcoal}
          strokeWidth={9}
        />
        <rect
          x={20}
          y={-30}
          width={70}
          height={12}
          rx={6}
          fill={BRAND.offWhite}
          opacity={0.55}
        />
      </g>
    </g>
  );
};
