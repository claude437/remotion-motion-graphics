import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { rrPath } from "../shapes";
import { BRAND, CAIRO } from "../theme";

/** Prescription card: "Rx", lines and a signature stroke. No drug names. */
export const PrescriptionCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
  opacity?: number;
}> = ({ x, y, w, h, p, opacity = 1 }) => {
  if (p <= 0 || opacity <= 0) return null;
  const sig = `M ${x - 70} ${y + h / 2 - 60} c 20 -30 30 20 50 -6 s 30 -20 44 4 s 24 10 40 -10`;
  const e = evolvePath(interpolate(p, [0.5, 1], [0, 1], CLAMP), sig);
  return (
    <g
      transform={`translate(0 ${interpolate(p, [0, 1], [50, 0])})`}
      opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP) * opacity}
    >
      <path
        d={rrPath(x, y, w, h, 28)}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={6}
        filter="url(#tay-shadow)"
      />
      <text
        x={x - w / 2 + 34}
        y={y - h / 2 + 92}
        direction="ltr"
        fontFamily={CAIRO}
        fontWeight={800}
        fontSize={76}
        fill={BRAND.charcoal}
      >
        Rx
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={x + w / 2 - 34 - [180, 150, 200, 120][i]}
          y={y - h / 2 + 140 + i * 34}
          width={[180, 150, 200, 120][i]}
          height={12}
          rx={6}
          fill={BRAND.gray}
        />
      ))}
      <path
        d={sig}
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={e.strokeDasharray}
        strokeDashoffset={e.strokeDashoffset}
      />
    </g>
  );
};

export const BLISTER_CELLS = Array.from({ length: 8 }, (_, i) => ({
  col: i % 2,
  row: Math.floor(i / 2),
}));

export const blisterCell = (
  x: number,
  y: number,
  w: number,
  h: number,
  i: number,
) => {
  const { col, row } = BLISTER_CELLS[i];
  return {
    x: x - w / 4 + col * (w / 2),
    y: y - h / 2 + 62 + row * ((h - 80) / 4),
  };
};

type BlisterProps = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly p: number;
  /** Index of the tablet that tries to leave the pack, and its offset in px. */
  readonly loose: {
    readonly index: number;
    readonly dx: number;
    readonly dy: number;
    readonly opacity: number;
  };
  readonly opacity?: number;
};

/** Blister pack with eight tablets; one can slide out (and be stopped). */
export const BlisterPack: React.FC<BlisterProps> = ({
  x,
  y,
  w,
  h,
  p,
  loose,
  opacity = 1,
}) => {
  if (p <= 0 || opacity <= 0) return null;
  return (
    <g
      transform={`translate(0 ${interpolate(p, [0, 1], [50, 0])})`}
      opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP) * opacity}
    >
      <path
        d={rrPath(x, y, w, h, 34)}
        fill={BRAND.beige}
        stroke={BRAND.charcoal}
        strokeWidth={6}
        filter="url(#tay-shadow)"
      />
      {BLISTER_CELLS.map((_, i) => {
        const c = blisterCell(x, y, w, h, i);
        const isLoose = i === loose.index;
        return (
          <g key={i}>
            <ellipse
              cx={c.x}
              cy={c.y}
              rx={46}
              ry={30}
              fill={BRAND.offWhite}
              stroke={BRAND.charcoal}
              strokeWidth={4}
              opacity={0.9}
            />
            {isLoose ? null : <Tablet x={c.x} y={c.y} />}
          </g>
        );
      })}
    </g>
  );
};

export const Tablet: React.FC<{
  x: number;
  y: number;
  opacity?: number;
  scale?: number;
}> = ({ x, y, opacity = 1, scale = 1 }) => {
  if (opacity <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse
        rx={32}
        ry={19}
        fill={BRAND.orangeBright}
        stroke={BRAND.charcoal}
        strokeWidth={4}
      />
      <line
        x1={0}
        y1={-12}
        x2={0}
        y2={12}
        stroke={BRAND.charcoal}
        strokeWidth={3}
        opacity={0.5}
      />
    </g>
  );
};

/** Stop bracket: a firm charcoal bar with end caps that interrupts the tablet's path. */
export const StopBracket: React.FC<{
  x: number;
  y: number;
  h: number;
  draw: number;
}> = ({ x, y, h, draw }) => {
  if (draw <= 0) return null;
  const d = `M ${x + 26} ${y - h / 2} L ${x} ${y - h / 2} L ${x} ${y + h / 2} L ${x + 26} ${y + h / 2}`;
  const e = evolvePath(draw, d);
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={BRAND.offWhite}
        strokeWidth={30}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={e.strokeDasharray}
        strokeDashoffset={e.strokeDashoffset}
        opacity={0.85}
      />
      <path
        d={d}
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={e.strokeDasharray}
        strokeDashoffset={e.strokeDashoffset}
      />
    </g>
  );
};
