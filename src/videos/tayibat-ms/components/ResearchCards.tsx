import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { LeafIcon } from "./FoodPlate";
import { rrPath } from "../shapes";
import { BRAND } from "../theme";

/** Research paper shape used both as a morph target and as the drawn card. */
export const paperPath = (x: number, y: number, w: number, h: number) =>
  rrPath(x, y, w, h, 18);

type PaperProps = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly rotation: number;
  /** 0 → 1: text lines draw in. */
  readonly lines: number;
  readonly opacity: number;
  /** Show the empty "result" box (no invented findings). */
  readonly emptyResult?: number;
};

/** One research paper: title bar, abstract lines and an empty result box. */
export const Paper: React.FC<PaperProps> = ({
  x,
  y,
  w,
  h,
  rotation,
  lines,
  opacity,
  emptyResult = 0,
}) => {
  if (opacity <= 0) return null;
  const left = x - w / 2 + 20;
  const right = x + w / 2 - 20;
  return (
    <g transform={`rotate(${rotation} ${x} ${y})`} opacity={opacity}>
      <path
        d={paperPath(x, y, w, h)}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={5}
        filter="url(#tay-shadow)"
      />
      <rect
        x={left}
        y={y - h / 2 + 20}
        width={(right - left) * Math.min(1, lines * 1.6)}
        height={14}
        rx={7}
        fill={BRAND.charcoal}
      />
      {[0, 1, 2, 3].map((i) => {
        const p = interpolate(
          lines,
          [0.15 + i * 0.15, 0.45 + i * 0.15],
          [0, 1],
          CLAMP,
        );
        const len = (right - left) * [1, 0.85, 0.95, 0.6][i] * p;
        return (
          <rect
            key={i}
            x={right - len}
            y={y - h / 2 + 52 + i * 24}
            width={len}
            height={9}
            rx={4.5}
            fill={BRAND.gray}
          />
        );
      })}
      {emptyResult > 0 ? (
        <rect
          x={left}
          y={y + h / 2 - 78}
          width={right - left}
          height={56}
          rx={10}
          fill="none"
          stroke={BRAND.charcoal}
          strokeWidth={4}
          strokeDasharray="8 8"
          opacity={emptyResult * 0.7}
        />
      ) : null}
    </g>
  );
};

export const Magnifier: React.FC<{
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
}> = ({ x, y, scale = 1, opacity = 1 }) => {
  if (opacity <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <line
        x1={38}
        y1={38}
        x2={86}
        y2={86}
        stroke={BRAND.charcoal}
        strokeWidth={16}
        strokeLinecap="round"
      />
      <circle
        r={54}
        fill={BRAND.offWhite}
        fillOpacity={0.35}
        stroke={BRAND.charcoal}
        strokeWidth={10}
      />
      <path
        d="M -30 -18 A 36 36 0 0 1 -6 -36"
        fill="none"
        stroke={BRAND.offWhite}
        strokeWidth={6}
        strokeLinecap="round"
      />
    </g>
  );
};

const Q_PATH = "M -26 -34 C -26 -74 34 -74 34 -36 C 34 -8 2 -4 2 22";

/** Question mark that draws itself; the dot pops in at the end. */
export const QuestionMark: React.FC<{
  x: number;
  y: number;
  draw: number;
  scale?: number;
  color?: string;
  opacity?: number;
}> = ({ x, y, draw, scale = 1, color = BRAND.charcoal, opacity = 1 }) => {
  if (draw <= 0 || opacity <= 0) return null;
  const e = evolvePath(interpolate(draw, [0, 0.8], [0, 1], CLAMP), Q_PATH);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <path
        d={Q_PATH}
        fill="none"
        stroke={color}
        strokeWidth={15}
        strokeLinecap="round"
        strokeDasharray={e.strokeDasharray}
        strokeDashoffset={e.strokeDashoffset}
      />
      <circle
        cx={2}
        cy={52}
        r={10 * interpolate(draw, [0.75, 1], [0, 1], CLAMP)}
        fill={color}
      />
    </g>
  );
};

type ResearchCardsProps = {
  readonly cx: number;
  readonly cy: number;
  readonly w: number;
  readonly h: number;
  readonly spread: number;
  /** 0 → 1 fan-out from a stack. */
  readonly unfold: number;
  readonly lines: number;
  readonly opacity: number;
};

export const paperLayout = (
  cx: number,
  cy: number,
  spread: number,
  unfold: number,
) =>
  [-2, -1, 0, 1, 2].map((k) => ({
    x: cx + (k * spread * unfold) / 2,
    y: cy + Math.abs(k) * 26 * unfold,
    rotation: k * 9 * unfold,
  }));

/** Fan of five research papers; the middle one holds the empty result box. */
export const ResearchCards: React.FC<ResearchCardsProps> = ({
  cx,
  cy,
  w,
  h,
  spread,
  unfold,
  lines,
  opacity,
}) => {
  if (opacity <= 0) return null;
  const layout = paperLayout(cx, cy, spread, unfold);
  const order = [0, 4, 1, 3, 2];
  return (
    <g>
      {order.map((i) => (
        <Paper
          key={i}
          {...layout[i]}
          w={w}
          h={h}
          lines={lines}
          opacity={opacity}
          emptyResult={i === 2 ? lines : 0}
        />
      ))}
    </g>
  );
};

/** Small card that names the diet; the Arabic label is drawn as HTML on top. */
export const DietCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
  opacity?: number;
}> = ({ x, y, w, h, p, opacity = 1 }) => {
  if (p <= 0 || opacity <= 0) return null;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${interpolate(p, [0, 1], [0.6, 1])}) translate(${-x} ${-y})`}
      opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP) * opacity}
    >
      <path
        d={rrPath(x, y, w, h, 26)}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={6}
        filter="url(#tay-shadow)"
      />
      <g
        transform={`translate(${x + w / 2 - 44} ${y - h / 2 + 4}) scale(0.62)`}
      >
        <circle
          r={44}
          fill={BRAND.orange}
          stroke={BRAND.charcoal}
          strokeWidth={6}
        />
        <g transform="scale(0.85)">
          <LeafIcon />
        </g>
      </g>
    </g>
  );
};
