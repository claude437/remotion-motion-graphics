import { interpolatePath } from "@remotion/paths";

/**
 * Path builders in absolute frame coordinates. Shapes that morph into each
 * other (plate sector → paper, outline → tile, boundary → glass, marker → MRI
 * card, brain → plate) are interpolated with @remotion/paths.
 */

const f = (n: number) => n.toFixed(2);

/** Rounded rectangle centered on (cx, cy). */
export const rrPath = (
  cx: number,
  cy: number,
  w: number,
  h: number,
  r: number,
) => {
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M ${f(x0 + rr)} ${f(y0)}`,
    `L ${f(x0 + w - rr)} ${f(y0)}`,
    `A ${f(rr)} ${f(rr)} 0 0 1 ${f(x0 + w)} ${f(y0 + rr)}`,
    `L ${f(x0 + w)} ${f(y0 + h - rr)}`,
    `A ${f(rr)} ${f(rr)} 0 0 1 ${f(x0 + w - rr)} ${f(y0 + h)}`,
    `L ${f(x0 + rr)} ${f(y0 + h)}`,
    `A ${f(rr)} ${f(rr)} 0 0 1 ${f(x0)} ${f(y0 + h - rr)}`,
    `L ${f(x0)} ${f(y0 + rr)}`,
    `A ${f(rr)} ${f(rr)} 0 0 1 ${f(x0 + rr)} ${f(y0)}`,
    "Z",
  ].join(" ");
};

/** Plate sector (pie slice) from angle a0 to a1 in degrees (0° = up, clockwise). */
export const sectorPath = (
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
) => {
  const p = (a: number, rad: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    return [cx + Math.cos(t) * rad, cy + Math.sin(t) * rad];
  };
  const inner = r * 0.16;
  const [x1, y1] = p(a0, r);
  const [x2, y2] = p(a1, r);
  const [x3, y3] = p(a1, inner);
  const [x4, y4] = p(a0, inner);
  return `M ${f(x4)} ${f(y4)} L ${f(x1)} ${f(y1)} A ${f(r)} ${f(r)} 0 0 1 ${f(x2)} ${f(y2)} L ${f(x3)} ${f(y3)} A ${f(inner)} ${f(inner)} 0 0 0 ${f(x4)} ${f(y4)} Z`;
};

/** Centroid-ish point of a sector, used to place icons and to slide sectors out. */
export const sectorCenter = (
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  k = 0.58,
) => {
  const t = (((a0 + a1) / 2 - 90) * Math.PI) / 180;
  return { x: cx + Math.cos(t) * r * k, y: cy + Math.sin(t) * r * k, angle: t };
};

export const circlePath = (cx: number, cy: number, r: number) =>
  `M ${f(cx - r)} ${f(cy)} A ${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)} A ${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)} Z`;

/** Tapered drinking glass outline (open-top look is drawn by the component). */
export const glassPath = (cx: number, cy: number, w: number, h: number) => {
  const top = cy - h / 2;
  const bot = cy + h / 2;
  const tw = w / 2;
  const bw = w * 0.38;
  return `M ${f(cx - tw)} ${f(top)} L ${f(cx + tw)} ${f(top)} L ${f(cx + bw)} ${f(bot - 18)} Q ${f(cx + bw)} ${f(bot)} ${f(cx + bw - 18)} ${f(bot)} L ${f(cx - bw + 18)} ${f(bot)} Q ${f(cx - bw)} ${f(bot)} ${f(cx - bw)} ${f(bot - 18)} Z`;
};

/** Safe wrapper: returns the start path at p<=0 and the end path at p>=1. */
export const morph = (p: number, from: string, to: string) =>
  p <= 0 ? from : p >= 1 ? to : interpolatePath(p, from, to);
