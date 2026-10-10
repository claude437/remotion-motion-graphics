import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { rrPath } from "../../tayibat-ms/shapes";
import { ARABIC_FONT, BRAND } from "../../vitamin-d-ms/theme";

const C = BRAND.charcoal;

/** Stroke drawn on with evolvePath (p 0 → 1). */
export const Drawn: React.FC<{ d: string; p: number; w?: number; color?: string; dash?: string; opacity?: number }> = ({ d, p, w = 6, color = C, dash, opacity = 1 }) => {
  const id = `mf-reveal-${React.useId().replace(/:/g, "")}`;
  if (p <= 0 || opacity <= 0) return null;
  const e = evolvePath(p, d);
  return dash ? (
    // Dashed strokes cannot use evolvePath's dash trick; reveal them with a mask instead.
    <g opacity={opacity}>
      <mask id={id}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={w + 6} strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
      </mask>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} mask={`url(#${id})`} />
    </g>
  ) : (
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} opacity={opacity} />
  );
};

/** Pops a group in around (x, y). */
export const Pop: React.FC<{ x: number; y: number; p: number; opacity?: number; s?: number; children: React.ReactNode }> = ({ x, y, p, opacity = 1, s = 1, children }) => {
  if (p <= 0 || opacity <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${interpolate(p, [0, 1], [0.6, 1]) * s})`} opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP) * opacity}>
      {children}
    </g>
  );
};

/** Round cream badge; children are drawn around (0, 0). */
export const Badge: React.FC<{ r?: number; children?: React.ReactNode }> = ({ r = 66, children }) => (
  <g>
    <circle r={r} fill={BRAND.offWhite} stroke={C} strokeWidth={6} />
    {children}
  </g>
);

/** Battery metaphor (not a mechanism): outline + modest cream level. */
export const Battery: React.FC<{ x: number; y: number; w: number; h: number; level: number; opacity?: number; stroke?: string; nub?: number }> = ({ x, y, w, h, level, opacity = 1, stroke = C, nub = 1 }) => {
  if (opacity <= 0 || w < 2) return null;
  const pad = Math.max(6, h * 0.11);
  const iw = (w - pad * 2) * Math.max(0, Math.min(1, level));
  return (
    <g opacity={opacity}>
      <rect x={x + w / 2 - 2} y={y - h * 0.2} width={h * 0.16} height={h * 0.4} rx={h * 0.06} fill={stroke} opacity={nub} />
      <path d={rrPath(x, y, w, h, h * 0.24)} fill={BRAND.orangeDeep} fillOpacity={0.35 * nub} stroke={stroke} strokeWidth={Math.max(4, h * 0.055)} />
      {iw > 1 ? <rect x={x - w / 2 + pad} y={y - h / 2 + pad} width={iw} height={h - pad * 2} rx={h * 0.13} fill={BRAND.offWhite} /> : null}
    </g>
  );
};

/** Bed with a lying faceless sleeper (head on the left). rise/lift 0 → 1 = waking and lifting the blanket. */
export const Bed: React.FC<{ cx: number; floor: number; draw: number; rise: number; lift: number; breathe?: number; opacity?: number; blanket?: boolean }> = ({ cx, floor, draw, rise, lift, breathe = 0, opacity = 1, blanket = true }) => {
  if (draw <= 0 || opacity <= 0) return null;
  const top = floor - 140;
  const k = (i: number) => interpolate(draw * 3 - i, [0, 1], [0, 1], CLAMP);
  const head = { x: cx - 190 + rise * 30, y: top - 32 - rise * 62 };
  const shoulder = { x: cx - 130 + rise * 6, y: top - 22 - rise * 34 };
  const corner = { x: cx - 150 + lift * 40, y: top - 40 - lift * 70 };
  const bTop = top - 38 + breathe;
  const blanketD = `M ${corner.x} ${corner.y} C ${cx - 60} ${bTop - 10 * lift} ${cx + 60} ${bTop} ${cx + 250} ${bTop + 4} L ${cx + 250} ${top + 34} L ${cx - 150} ${top + 34} Z`;
  return (
    <g opacity={opacity}>
      <Drawn d={`M ${cx - 255} ${floor} L ${cx - 255} ${top - 190}`} p={k(0)} w={12} />
      <Drawn d={`M ${cx + 250} ${floor} L ${cx + 250} ${top + 10}`} p={k(0)} w={12} />
      <g opacity={k(1)}>
        <rect x={cx - 255} y={top} width={510} height={52} rx={14} fill={BRAND.beige} stroke={C} strokeWidth={6} />
        <ellipse cx={cx - 192} cy={top - 6} rx={56} ry={20} fill={BRAND.offWhite} stroke={C} strokeWidth={5} />
      </g>
      <g opacity={k(2)}>
        <line x1={cx - 40} y1={top - 18} x2={shoulder.x} y2={shoulder.y} stroke={C} strokeWidth={50} strokeLinecap="round" />
        <line x1={cx - 40} y1={top - 18} x2={shoulder.x} y2={shoulder.y} stroke={BRAND.offWhite} strokeWidth={40} strokeLinecap="round" />
        <circle cx={head.x} cy={head.y} r={34} fill={BRAND.offWhite} stroke={C} strokeWidth={6} />
        {blanket ? <path d={blanketD} fill={BRAND.offWhite} stroke={C} strokeWidth={6} strokeLinejoin="round" /> : null}
        {lift > 0.01 ? (
          <path
            d={`M ${shoulder.x} ${shoulder.y} Q ${shoulder.x - 30} ${shoulder.y + 40} ${corner.x + 4} ${corner.y + 6}`}
            fill="none"
            stroke={C}
            strokeWidth={16}
            strokeLinecap="round"
            opacity={interpolate(lift, [0, 0.2], [0, 1], CLAMP)}
          />
        ) : null}
      </g>
    </g>
  );
};

/** Bedroom window with a small sun rising (0 → 1). */
export const SunWindow: React.FC<{ x: number; y: number; p: number; rise: number }> = ({ x, y, p, rise }) => {
  if (p <= 0) return null;
  return (
    <g opacity={interpolate(p, [0, 0.5], [0, 1], CLAMP)}>
      <clipPath id="fw-win">
        <rect x={x - 90} y={y - 80} width={180} height={160} rx={18} />
      </clipPath>
      <rect x={x - 90} y={y - 80} width={180} height={160} rx={18} fill={BRAND.orangeDeep} fillOpacity={0.35} />
      <g clipPath="url(#fw-win)">
        <circle cx={x} cy={y + 110 - rise * 120} r={42} fill={BRAND.offWhite} stroke={C} strokeWidth={5} />
        <rect x={x - 90} y={y + 46} width={180} height={40} fill={BRAND.beige} />
      </g>
      <rect x={x - 90} y={y - 80} width={180} height={160} rx={18} fill="none" stroke={C} strokeWidth={6} />
      <line x1={x} y1={y - 80} x2={x} y2={y + 46} stroke={C} strokeWidth={4} opacity={0.5} />
    </g>
  );
};

export const MoonGlyph: React.FC<{ r?: number }> = ({ r = 34 }) => (
  <path d={`M ${r * 0.3} ${-r} A ${r} ${r} 0 1 0 ${r} ${r * 0.35} A ${r * 0.78} ${r * 0.78} 0 0 1 ${r * 0.3} ${-r} Z`} fill={BRAND.beige} stroke={C} strokeWidth={5} strokeLinejoin="round" />
);

/** Factor icons (inside a Badge). */
export const PainGlyph: React.FC = () => (
  <g>
    <circle cx={0} cy={-30} r={11} fill="none" stroke={C} strokeWidth={5} />
    <path d="M 0 -18 L 0 14 M -20 -8 L 20 -8 M 0 14 L -12 40 M 0 14 L 12 40" stroke={C} strokeWidth={5} strokeLinecap="round" fill="none" />
    <circle cx={14} cy={4} r={8} fill={BRAND.orangeBright} />
    <circle cx={14} cy={4} r={14} fill="none" stroke={BRAND.orangeBright} strokeWidth={3} opacity={0.6} />
  </g>
);
export const PillGlyph: React.FC = () => (
  <g transform="rotate(-35)">
    <rect x={-34} y={-14} width={68} height={28} rx={14} fill={BRAND.offWhite} stroke={C} strokeWidth={5} />
    <path d="M 0 -14 L 0 14" stroke={C} strokeWidth={4} />
    <path d="M 0 -14 L 20 -14 A 14 14 0 0 1 20 14 L 0 14 Z" fill={BRAND.beige} />
    <rect x={-34} y={-14} width={68} height={28} rx={14} fill="none" stroke={C} strokeWidth={5} />
  </g>
);
export const HeatGlyph: React.FC = () => (
  <g>
    <rect x={-10} y={-38} width={20} height={56} rx={10} fill={BRAND.offWhite} stroke={C} strokeWidth={5} />
    <circle cx={0} cy={26} r={15} fill={BRAND.orangeBright} stroke={C} strokeWidth={5} />
    <rect x={-3.5} y={-14} width={7} height={34} fill={BRAND.orangeBright} />
    {[-1, 1].map((s) => (
      <path key={s} d={`M ${s * 28} -26 q ${s * 8} 10 0 20 q ${-s * 8} 10 0 20`} fill="none" stroke={C} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
    ))}
  </g>
);

/** Assessment icons. */
export const DropGlyph: React.FC = () => (
  <path d="M 0 -38 C 18 -14 30 2 30 16 A 30 30 0 0 1 -30 16 C -30 2 -18 -14 0 -38 Z" fill={BRAND.orangeBright} stroke={C} strokeWidth={5} />
);
export const ThyroidGlyph: React.FC = () => (
  <g fill={BRAND.beige} stroke={C} strokeWidth={5} strokeLinejoin="round">
    <path d="M -6 -6 C -14 -34 -40 -34 -40 -4 C -40 22 -18 34 -6 16 Z" />
    <path d="M 6 -6 C 14 -34 40 -34 40 -4 C 40 22 18 34 6 16 Z" />
    <rect x={-10} y={-2} width={20} height={16} rx={6} />
  </g>
);
export const VitaminGlyph: React.FC = () => (
  <g>
    <rect x={-26} y={-34} width={52} height={68} rx={10} fill={BRAND.offWhite} stroke={C} strokeWidth={5} />
    <rect x={-16} y={-20} width={32} height={8} rx={4} fill={BRAND.gray} />
    <circle cx={-6} cy={8} r={8} fill={BRAND.beige} stroke={C} strokeWidth={3} />
    <circle cx={10} cy={14} r={6} fill={BRAND.orangeBright} />
  </g>
);

/** Small month calendar; `days` (0 → 5) = how many session ticks are filled. */
export const Calendar: React.FC<{ x: number; y: number; days: number; opacity?: number }> = ({ x, y, days, opacity = 1 }) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      <path d={rrPath(x, y, 200, 160, 20)} fill={BRAND.offWhite} stroke={C} strokeWidth={6} />
      <path d={`M ${x - 100} ${y - 40} L ${x + 100} ${y - 40}`} stroke={C} strokeWidth={5} />
      <rect x={x - 100} y={y - 80} width={200} height={40} rx={18} fill={BRAND.beige} opacity={0.7} />
      {[-50, 50].map((dx) => (
        <line key={dx} x1={x + dx} y1={y - 94} x2={x + dx} y2={y - 68} stroke={C} strokeWidth={7} strokeLinecap="round" />
      ))}
      {Array.from({ length: 5 }, (_, i) => {
        const cxi = x + 72 - i * 36;
        const on = interpolate(days - i, [0, 1], [0, 1], CLAMP);
        return (
          <g key={i}>
            <circle cx={cxi} cy={y + 10} r={13} fill="none" stroke={C} strokeWidth={4} opacity={0.35} />
            <circle cx={cxi} cy={y + 10} r={13 * on} fill={BRAND.orangeBright} />
            <circle cx={cxi} cy={y + 48} r={13} fill="none" stroke={C} strokeWidth={4} opacity={0.2} />
          </g>
        );
      })}
    </g>
  );
};

/** Gentle progression marker: three steps rising (p 0 → 1). */
export const Steps: React.FC<{ x: number; y: number; p: number }> = ({ x, y, p }) => {
  if (p <= 0) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const q = interpolate(p * 3 - i, [0, 1], [0, 1], CLAMP);
        const h = 34 + i * 30;
        return <rect key={i} x={x + 50 - i * 50 - 20} y={y + 50 - h * q} width={40} height={h * q} rx={8} fill={BRAND.offWhite} stroke={C} strokeWidth={5} opacity={q > 0 ? 1 : 0} />;
      })}
      <path d={`M ${x + 70} ${y - 20} Q ${x} ${y - 60} ${x - 60} ${y - 90}`} fill="none" stroke={C} strokeWidth={5} strokeLinecap="round" opacity={interpolate(p, [0.7, 1], [0, 1], CLAMP)} />
      <path d={`M ${x - 60} ${y - 90} l 22 -2 m -22 2 l 10 20`} fill="none" stroke={C} strokeWidth={5} strokeLinecap="round" opacity={interpolate(p, [0.8, 1], [0, 1], CLAMP)} />
    </g>
  );
};

/** Fixed band anchor: post with ring at hand height. */
export const Anchor: React.FC<{ x: number; floor: number; ringY: number; p: number; opacity?: number }> = ({ x, floor, ringY, p, opacity = 1 }) => (
  <g opacity={opacity}>
    <Drawn d={`M ${x} ${floor} L ${x} ${floor - 300}`} p={p} w={14} />
    <rect x={x - 26} y={floor - 8} width={52} height={10} rx={5} fill={C} opacity={p} />
    <circle cx={x + 12} cy={ringY} r={11} fill="none" stroke={C} strokeWidth={6} opacity={p} />
  </g>
);

/** Ceiling-free standing fan; blades rotate with `angle` (deg). */
export const Fan: React.FC<{ x: number; y: number; r: number; floor: number; angle: number; p: number; opacity?: number }> = ({ x, y, r, floor, angle, p, opacity = 1 }) => {
  if (p <= 0 || opacity <= 0) return null;
  return (
    <g opacity={opacity * interpolate(p, [0, 0.4], [0, 1], CLAMP)}>
      <Drawn d={`M ${x} ${y + r} L ${x} ${floor}`} p={p} w={10} />
      <rect x={x - 50} y={floor - 10} width={100} height={12} rx={6} fill={C} />
      <circle cx={x} cy={y} r={r} fill={BRAND.offWhite} stroke={C} strokeWidth={7} />
      <g transform={`rotate(${angle} ${x} ${y})`}>
        {[0, 120, 240].map((a) => (
          <ellipse key={a} cx={x} cy={y - r * 0.42} rx={r * 0.2} ry={r * 0.4} fill={BRAND.beige} stroke={C} strokeWidth={4} transform={`rotate(${a} ${x} ${y})`} />
        ))}
      </g>
      <circle cx={x} cy={y} r={9} fill={C} />
    </g>
  );
};

/** Simple side-view sofa (seat faces left, back on the right). */
export const Sofa: React.FC<{ cx: number; floor: number; p: number }> = ({ cx, floor, p }) => {
  if (p <= 0) return null;
  return (
    <g opacity={interpolate(p, [0, 0.5], [0, 1], CLAMP)}>
      <path d={rrPath(cx + 90, floor - 175, 44, 190, 18)} fill={BRAND.beige} stroke={C} strokeWidth={6} />
      <path d={rrPath(cx, floor - 92, 220, 40, 14)} fill={BRAND.beige} stroke={C} strokeWidth={6} />
      <line x1={cx - 90} y1={floor - 72} x2={cx - 90} y2={floor} stroke={C} strokeWidth={9} strokeLinecap="round" />
      <line x1={cx + 90} y1={floor - 72} x2={cx + 90} y2={floor} stroke={C} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};

/** Numbered routine node (Arabic-Indic numerals). */
export const Node: React.FC<{ x: number; y: number; r: number; n: string; active: number; p: number }> = ({ x, y, r, n, active, p }) => (
  <Pop x={x} y={y} p={p}>
    {active > 0 ? <circle r={r + 12} fill="none" stroke={BRAND.offWhite} strokeWidth={5} opacity={0.8 * active} /> : null}
    <circle r={r} fill={active > 0.5 ? BRAND.orangeBright : BRAND.offWhite} stroke={C} strokeWidth={5} />
    <text y={r * 0.36} textAnchor="middle" fontFamily={ARABIC_FONT} fontWeight={700} fontSize={r * 1.05} fill={active > 0.5 ? BRAND.offWhite : C}>
      {n}
    </text>
  </Pop>
);

/** Cream card (rounded rect) with optional abstract text lines. */
export const CardShape: React.FC<{ x: number; y: number; w: number; h: number; r?: number; lines?: number; shadow?: boolean; opacity?: number; stroke?: string }> = ({ x, y, w, h, r = 32, lines = 0, shadow = true, opacity = 1, stroke }) => {
  if (opacity <= 0 || w < 1) return null;
  return (
    <g opacity={opacity}>
      <path d={rrPath(x, y, w, h, r)} fill={BRAND.offWhite} filter={shadow ? "url(#mf-shadow)" : undefined} stroke={stroke} strokeWidth={stroke ? 6 : 0} />
      {Array.from({ length: lines }, (_, i) => (
        <rect key={i} x={x + w / 2 - 28 - w * (0.62 - i * 0.18)} y={y - (lines - 1) * 15 + i * 30 - 6} width={w * (0.62 - i * 0.18)} height={12} rx={6} fill={BRAND.gray} />
      ))}
    </g>
  );
};
