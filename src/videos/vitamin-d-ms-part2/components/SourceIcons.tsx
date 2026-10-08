import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { ARABIC_FONT, BRAND } from "../../vitamin-d-ms/theme";

/** Shared look: charcoal 7px outlines, beige/off-white fills, orange accents. */
const S = { stroke: BRAND.charcoal, sw: 7 } as const;

export const FishIcon: React.FC<{ sec: number }> = ({ sec }) => {
  const tail = Math.sin(sec * 4) * 6;
  return (
    <g>
      <path
        d={`M 62 0 L 100 ${-34 + tail} L 96 ${34 + tail} Z`}
        fill={BRAND.beige}
        stroke={S.stroke}
        strokeWidth={S.sw}
        strokeLinejoin="round"
      />
      <path
        d="M -92 0 C -60 -54 20 -60 66 0 C 20 60 -60 54 -92 0 Z"
        fill={BRAND.beige}
        stroke={S.stroke}
        strokeWidth={S.sw}
        strokeLinejoin="round"
      />
      {/* omega-rich orange belly band */}
      <path
        d="M -70 14 C -30 40 20 40 52 14"
        fill="none"
        stroke={BRAND.orange}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d="M -40 -30 C -30 -8 -30 8 -40 30"
        fill="none"
        stroke={S.stroke}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle cx={-64} cy={-8} r={7} fill={S.stroke} />
    </g>
  );
};

export const FortifiedFoodIcon: React.FC = () => (
  <g>
    {/* milk carton */}
    <path
      d="M -50 -40 L -30 -78 L 30 -78 L 50 -40 L 50 86 L -50 86 Z"
      fill={BRAND.offWhite}
      stroke={S.stroke}
      strokeWidth={S.sw}
      strokeLinejoin="round"
    />
    <path d="M -50 -40 L 50 -40" stroke={S.stroke} strokeWidth={5} />
    <rect x={-22} y={-96} width={44} height={20} rx={4} fill={S.stroke} />
    <rect x={-50} y={0} width={100} height={46} fill={BRAND.beige} />
    {/* "+D" fortified badge */}
    <g transform="translate(46 -46)">
      <circle r={30} fill={BRAND.orange} stroke={S.stroke} strokeWidth={6} />
      <text
        y={11}
        textAnchor="middle"
        direction="ltr"
        fontFamily={ARABIC_FONT}
        fontWeight={700}
        fontSize={30}
        fill={BRAND.offWhite}
      >
        +D
      </text>
    </g>
  </g>
);

export const SupplementIcon: React.FC = () => (
  <g>
    {/* bottle */}
    <rect
      x={-58}
      y={-50}
      width={78}
      height={130}
      rx={18}
      fill={BRAND.offWhite}
      stroke={S.stroke}
      strokeWidth={S.sw}
    />
    <rect x={-50} y={-82} width={62} height={34} rx={8} fill={S.stroke} />
    <rect x={-58} y={0} width={78} height={44} fill={BRAND.beige} />
    <text
      x={-19}
      y={34}
      textAnchor="middle"
      direction="ltr"
      fontFamily={ARABIC_FONT}
      fontWeight={700}
      fontSize={30}
      fill={S.stroke}
    >
      D
    </text>
    {/* softgels */}
    {[
      [56, 10, -30],
      [70, 62, 20],
    ].map(([cx, cy, rot], i) => (
      <g key={i} transform={`translate(${cx} ${cy}) rotate(${rot})`}>
        <ellipse
          rx={30}
          ry={18}
          fill={BRAND.orange}
          stroke={S.stroke}
          strokeWidth={6}
        />
        <ellipse
          cx={-8}
          cy={-6}
          rx={10}
          ry={4}
          fill={BRAND.offWhite}
          opacity={0.6}
        />
      </g>
    ))}
  </g>
);

type SourceCellProps = {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  /** 0 → 1 spring; the cell unfolds from `from` to (x, y). */
  readonly progress: number;
  readonly from?: { x: number; y: number };
  readonly opacity?: number;
  readonly children?: React.ReactNode;
};

/** Off-white rounded tile holding one source icon (icon centered slightly above middle). */
export const SourceCell: React.FC<SourceCellProps> = ({
  x,
  y,
  size,
  progress,
  from,
  opacity = 1,
  children,
}) => {
  if (progress <= 0 || opacity <= 0) return null;
  const cx = from ? interpolate(progress, [0, 1], [from.x, x]) : x;
  const cy = from ? interpolate(progress, [0, 1], [from.y, y]) : y;
  const sc = interpolate(progress, [0, 1], [0.4, 1]);
  return (
    <g
      transform={`translate(${cx} ${cy}) scale(${sc})`}
      opacity={interpolate(progress, [0, 0.3], [0, 1], CLAMP) * opacity}
    >
      <rect
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        rx={40}
        fill={BRAND.offWhite}
        filter="url(#p2-shadow)"
      />
      <g transform="translate(0 -36)">{children}</g>
    </g>
  );
};
