import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { rrPath } from "../../tayibat-ms/shapes";
import { BRAND } from "../../vitamin-d-ms/theme";

const C = BRAND.charcoal;
const sw = 7;

const Drawn: React.FC<{ d: string; p: number; w?: number; color?: string; fill?: string }> = ({ d, p, w = sw, color = C, fill }) => {
  if (p <= 0) return null;
  const e = evolvePath(p, d);
  return (
    <g>
      {fill ? <path d={d} fill={fill} opacity={interpolate(p, [0.6, 1], [0, 1], CLAMP)} /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
    </g>
  );
};

/** Sturdy side-view chair facing left: seat x∈[cx−60, cx+60], backrest at cx+60. */
export const Chair: React.FC<{ cx: number; floor: number; draw: number; opacity?: number }> = ({ cx, floor, draw, opacity = 1 }) => {
  if (draw <= 0 || opacity <= 0) return null;
  const seat = floor - 100;
  const k = (i: number) => interpolate(draw * 4 - i, [0, 1], [0, 1], CLAMP);
  return (
    <g opacity={opacity}>
      <Drawn d={`M ${cx - 54} ${seat} L ${cx - 54} ${floor}`} p={k(1)} w={10} />
      <Drawn d={`M ${cx + 54} ${seat} L ${cx + 54} ${floor}`} p={k(1)} w={10} />
      <Drawn d={`M ${cx + 60} ${seat} L ${cx + 60} ${floor - 292}`} p={k(2)} w={10} />
      <g opacity={k(0)}>
        <rect x={cx - 64} y={seat - 8} width={128} height={18} rx={9} fill={BRAND.beige} stroke={C} strokeWidth={6} />
      </g>
      <g opacity={k(3)}>
        <rect x={cx + 48} y={floor - 292} width={26} height={110} rx={10} fill={BRAND.beige} stroke={C} strokeWidth={6} />
      </g>
    </g>
  );
};

/** Fixed wall handrail: post + horizontal bar at hand height. */
export const WallRail: React.FC<{ x: number; floor: number; draw: number; opacity?: number }> = ({ x, floor, draw, opacity = 1 }) => {
  if (draw <= 0 || opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      <Drawn d={`M ${x} ${floor} L ${x} ${floor - 310}`} p={interpolate(draw, [0, 0.6], [0, 1], CLAMP)} w={12} />
      <Drawn d={`M ${x - 10} ${floor - 265} L ${x + 92} ${floor - 265}`} p={interpolate(draw, [0.4, 1], [0, 1], CLAMP)} w={12} />
      <rect x={x - 22} y={floor - 8} width={44} height={10} rx={5} fill={C} opacity={draw} />
    </g>
  );
};

export const Cane: React.FC<{ hand: { x: number; y: number }; floor: number; opacity?: number }> = ({ hand, floor, opacity = 1 }) => (
  <g opacity={opacity}>
    <path d={`M ${hand.x + 14} ${hand.y - 4} Q ${hand.x} ${hand.y - 18} ${hand.x - 6} ${hand.y} L ${hand.x - 14} ${floor}`} fill="none" stroke={C} strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** Side-view walker frame; its handle is where the hands rest. */
export const Walker: React.FC<{ x: number; floor: number; scale: number; opacity?: number }> = ({ x, floor, scale, opacity = 1 }) => {
  const h = 210 * scale;
  return (
    <g opacity={opacity} stroke={C} strokeWidth={8} strokeLinecap="round" fill="none">
      <path d={`M ${x} ${floor - h} L ${x - 40 * scale} ${floor} M ${x} ${floor - h} L ${x + 30 * scale} ${floor}`} />
      <path d={`M ${x - 20 * scale} ${floor - h * 0.45} L ${x + 16 * scale} ${floor - h * 0.45}`} strokeWidth={6} />
      <path d={`M ${x} ${floor - h} L ${x + 34 * scale} ${floor - h}`} strokeWidth={10} />
    </g>
  );
};
export const walkerHandle = (x: number, floor: number, scale: number) => ({ x: x + 30 * scale, y: floor - 210 * scale });

/** Schematic brain (side view) for the simplified CNS motor pathway. */
export const BRAIN_PATH = (x: number, y: number) =>
  `M ${x - 98} ${y + 20} C ${x - 118} ${y - 40} ${x - 70} ${y - 92} ${x - 14} ${y - 86} C ${x + 30} ${y - 104} ${x + 92} ${y - 80} ${x + 102} ${y - 30} C ${x + 126} ${y + 10} ${x + 96} ${y + 60} ${x + 50} ${y + 58} C ${x + 30} ${y + 76} ${x - 12} ${y + 74} ${x - 28} ${y + 58} C ${x - 64} ${y + 70} ${x - 100} ${y + 54} ${x - 98} ${y + 20} Z`;

export const Brain: React.FC<{ x: number; y: number; draw: number; opacity?: number }> = ({ x, y, draw, opacity = 1 }) => {
  if (draw <= 0 || opacity <= 0) return null;
  const folds = [
    `M ${x - 60} ${y - 30} C ${x - 40} ${y - 50} ${x - 10} ${y - 40} ${x} ${y - 60}`,
    `M ${x - 30} ${y + 10} C ${x - 10} ${y - 10} ${x + 30} ${y} ${x + 50} ${y - 24}`,
    `M ${x + 20} ${y + 40} C ${x + 40} ${y + 30} ${x + 60} ${y + 34} ${x + 80} ${y + 14}`,
  ];
  return (
    <g opacity={opacity}>
      <Drawn d={BRAIN_PATH(x, y)} p={draw} w={7} fill={BRAND.offWhite} />
      {folds.map((d, i) => (
        <Drawn key={i} d={d} p={interpolate(draw, [0.5 + i * 0.1, 0.9 + i * 0.03], [0, 1], CLAMP)} w={5} color={BRAND.beige} />
      ))}
    </g>
  );
};

/** Spindle-shaped muscle with fibers. */
export const Muscle: React.FC<{ x: number; y: number; s?: number; rot?: number; opacity?: number }> = ({ x, y, s = 1, rot = 0, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <path d="M -60 0 C -30 -34 30 -34 60 0 C 30 34 -30 34 -60 0 Z" fill={BRAND.beige} stroke={C} strokeWidth={6} />
    <path d="M -36 -6 C -10 -16 10 -16 36 -6 M -36 8 C -10 18 10 18 36 8" fill="none" stroke={BRAND.orangeShadow} strokeWidth={4} strokeLinecap="round" />
  </g>
);

/** Spirit-level style balance symbol. */
export const BalanceSymbol: React.FC<{ x: number; y: number; s?: number; t: number; opacity?: number }> = ({ x, y, s = 1, t, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <rect x={-80} y={-26} width={160} height={52} rx={26} fill={BRAND.offWhite} stroke={C} strokeWidth={6} />
    <line x1={-18} y1={-26} x2={-18} y2={26} stroke={C} strokeWidth={4} />
    <line x1={18} y1={-26} x2={18} y2={26} stroke={C} strokeWidth={4} />
    <circle cx={Math.sin(t * 2) * 6} cy={0} r={13} fill={BRAND.orangeBright} />
  </g>
);

type IconKind = "weak" | "stiff" | "sway" | "lift";

/** Round badge with a small symptom illustration (possible effects, not certainties). */
export const SymptomIcon: React.FC<{ kind: IconKind; x: number; y: number; p: number; t: number; opacity?: number }> = ({ kind, x, y, p, t, opacity = 1 }) => {
  if (p <= 0 || opacity <= 0) return null;
  const sc = interpolate(p, [0, 1], [0.6, 1]);
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP) * opacity}>
      <circle r={56} fill={BRAND.offWhite} stroke={C} strokeWidth={6} />
      {kind === "weak" ? (
        <g>
          {/* reduced force: meter with low fill + down arrow */}
          <rect x={-30} y={-30} width={22} height={60} rx={8} fill="none" stroke={C} strokeWidth={5} />
          <rect x={-27} y={10} width={16} height={17} rx={5} fill={BRAND.orangeBright} />
          <path d="M 22 -26 L 22 22 M 8 8 L 22 24 L 36 8" fill="none" stroke={C} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : kind === "stiff" ? (
        <g>
          {/* restricted knee bend: limited arc + stop tick */}
          <path d="M -6 -34 L 4 2 L -14 34" fill="none" stroke={C} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 18 -8 A 18 18 0 0 1 16 16" fill="none" stroke={BRAND.orangeBright} strokeWidth={5} strokeLinecap="round" />
          <line x1={10} y1={22} x2={26} y2={14} stroke={C} strokeWidth={5} strokeLinecap="round" />
        </g>
      ) : kind === "sway" ? (
        <g transform={`rotate(${Math.sin(t * 3) * 5} 0 30)`}>
          {/* gentle sway: upright line over a base, with side arcs */}
          <line x1={0} y1={30} x2={0} y2={-26} stroke={C} strokeWidth={7} strokeLinecap="round" />
          <circle cx={0} cy={-32} r={8} fill={C} />
          <path d="M -30 -18 Q -40 0 -30 18 M 30 -18 Q 40 0 30 18" fill="none" stroke={BRAND.orangeBright} strokeWidth={5} strokeLinecap="round" />
          <line x1={-22} y1={32} x2={22} y2={32} stroke={C} strokeWidth={5} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          {/* reduced forefoot lift: foot + short dashed lift arc */}
          <path d="M 26 18 L -24 18 Q -36 18 -34 8 L -4 -2 L 18 -24 L 26 -24 Z" fill={BRAND.beige} stroke={C} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -34 2 Q -40 -16 -26 -26" fill="none" stroke={BRAND.orangeBright} strokeWidth={5} strokeDasharray="6 6" strokeLinecap="round" />
          <path d="M -32 -22 L -24 -28 L -22 -18" fill="none" stroke={BRAND.orangeBright} strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/** Small series topic card. Active = orange outline + walking glyph; others abstract. */
export const TopicCard: React.FC<{ x: number; y: number; w: number; h: number; p: number; active: number; glow?: number; glyph?: boolean; opacity?: number }> = ({ x, y, w, h, p, active, glow = 0, glyph, opacity = 1 }) => {
  if (p <= 0 || opacity <= 0) return null;
  const sc = interpolate(p, [0, 1], [0.7, 1]);
  return (
    <g transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`} opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP) * opacity}>
      {glow > 0 ? <path d={rrPath(x, y, w + 26, h + 26, 38)} fill="none" stroke={BRAND.offWhite} strokeWidth={6} opacity={0.75 * glow} /> : null}
      <path d={rrPath(x, y, w, h, 28)} fill={BRAND.offWhite} filter="url(#mw-shadow)" />
      <path d={rrPath(x, y, w, h, 28)} fill="none" stroke={active > 0 ? BRAND.orangeBright : C} strokeWidth={active > 0 ? 4 + 4 * active : 4} strokeOpacity={active > 0 ? 1 : 0.25} />
      {glyph ? null : (
        <g opacity={0.45}>
          <circle cx={x + w / 2 - 44} cy={y - 18} r={18} fill={BRAND.beige} />
          <rect x={x - w / 2 + 26} y={y - 24} width={100} height={12} rx={6} fill={BRAND.gray} />
          <rect x={x - w / 2 + 26} y={y + 6} width={140} height={12} rx={6} fill={BRAND.gray} />
          <rect x={x - w / 2 + 26} y={y + 34} width={80} height={12} rx={6} fill={BRAND.gray} />
        </g>
      )}
    </g>
  );
};

/** Speech bubble with a "?" (page question) or abstract lines (responses). */
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; p: number; tail: "left" | "right"; kind: "question" | "lines"; opacity?: number }> = ({ x, y, w, h, p, tail, kind, opacity = 1 }) => {
  if (p <= 0 || opacity <= 0) return null;
  const sc = interpolate(p, [0, 1], [0.4, 1]);
  const tx = tail === "left" ? x - w / 2 + 34 : x + w / 2 - 34;
  const dir = tail === "left" ? -1 : 1;
  return (
    <g transform={`translate(${tx} ${y + h / 2}) scale(${sc}) translate(${-tx} ${-(y + h / 2)})`} opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP) * opacity}>
      <path d={`M ${tx - 16} ${y + h / 2 - 4} L ${tx + dir * 22} ${y + h / 2 + 34} L ${tx + 22} ${y + h / 2 - 4} Z`} fill={BRAND.offWhite} stroke={C} strokeWidth={5} strokeLinejoin="round" />
      <path d={rrPath(x, y, w, h, Math.min(40, h / 2))} fill={BRAND.offWhite} stroke={C} strokeWidth={5} />
      <rect x={tx - 13} y={y + h / 2 - 6} width={30} height={10} fill={BRAND.offWhite} />
      {kind === "question" ? (
        <g transform={`translate(${x} ${y + 4})`}>
          <path d="M -12 -18 C -12 -36 16 -36 16 -18 C 16 -6 2 -4 2 8" fill="none" stroke={C} strokeWidth={8} strokeLinecap="round" />
          <circle cx={2} cy={24} r={5} fill={C} />
        </g>
      ) : (
        <g>
          <rect x={x + w / 2 - 30 - w * 0.6} y={y - 14} width={w * 0.6} height={11} rx={5.5} fill={BRAND.gray} />
          <rect x={x + w / 2 - 30 - w * 0.4} y={y + 8} width={w * 0.4} height={11} rx={5.5} fill={BRAND.gray} />
        </g>
      )}
    </g>
  );
};

export const PauseBadge: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => {
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${interpolate(p, [0, 1], [0.5, 1])})`} opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP)}>
      <circle r={32} fill={BRAND.offWhite} stroke={C} strokeWidth={5} />
      <rect x={-11} y={-13} width={7} height={26} rx={3} fill={C} />
      <rect x={4} y={-13} width={7} height={26} rx={3} fill={C} />
    </g>
  );
};

/** Parallel-bar support used inside the rehabilitation card. */
export const SupportBar: React.FC<{ x1: number; x2: number; y: number; floor: number; opacity?: number }> = ({ x1, x2, y, floor, opacity = 1 }) => (
  <g opacity={opacity} stroke={C} strokeLinecap="round">
    <line x1={x1} y1={y} x2={x2} y2={y} strokeWidth={9} />
    <line x1={x1 + 10} y1={y} x2={x1 + 10} y2={floor} strokeWidth={7} />
    <line x1={x2 - 10} y1={y} x2={x2 - 10} y2={floor} strokeWidth={7} />
  </g>
);
