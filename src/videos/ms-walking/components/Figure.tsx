import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { BRAND } from "../../vitamin-d-ms/theme";

/** Segment lengths (px at scale 1). Faces left (−x), the RTL reading direction. */
const L = { thigh: 100, shin: 100, foot: 36, footH: 12, torso: 125, neck: 12, head: 34, upper: 76, fore: 70 } as const;

type Pt = { x: number; y: number };

export type FigurePose = {
  /** Ankle x (feet stay planted here when sitting / heel raising). */
  readonly x: number;
  readonly floor: number;
  readonly scale?: number;
  /** Walk phase in cycles; stride 0 = standing still. */
  readonly phase?: number;
  readonly stride?: number;
  /** 0 = standing, 1 = seated (hip on a chair seat behind the ankles). */
  readonly sit?: number;
  /** 0 → 1 heel raise: toes stay on the floor, ankles lift. */
  readonly heel?: number;
  /** Forward/back hip shift in px (gentle weight shift). */
  readonly shift?: number;
  /** Extra forward torso lean (rad). */
  readonly lean?: number;
  /** Hands reach this fixed point (blend 0 → 1). */
  readonly hands?: Pt;
  readonly handsAmt?: number;
  /** Only the front hand reaches `hands` (e.g. a cane). */
  readonly oneHand?: boolean;
  /** 0 → 1 path reveal of the figure (forming). */
  readonly draw?: number;
  readonly opacity?: number;
};

const ik = (s: Pt, t: Pt, a: number, b: number): Pt => {
  const dx = t.x - s.x;
  const dy = t.y - s.y;
  const d = Math.min(a + b - 0.5, Math.max(Math.abs(a - b) + 0.5, Math.hypot(dx, dy)));
  const base = Math.atan2(dy, dx);
  const ang = Math.acos((a * a + d * d - b * b) / (2 * a * d));
  const e1 = { x: s.x + Math.cos(base + ang) * a, y: s.y + Math.sin(base + ang) * a };
  const e2 = { x: s.x + Math.cos(base - ang) * a, y: s.y + Math.sin(base - ang) * a };
  return e1.y > e2.y ? e1 : e2; // elbow points down
};

/** Computes joint positions for a pose (absolute px). */
export const solveFigure = (p: FigurePose) => {
  const s = p.scale ?? 1;
  const stride = p.stride ?? 0;
  const sit = p.sit ?? 0;
  const heel = p.heel ?? 0;
  const T = L.thigh * s;
  const S = L.shin * s;
  const ankleY = p.floor - L.footH * s - heel * 22 * s;
  const ph = (p.phase ?? 0) * Math.PI * 2;

  type Leg = { hip: Pt; knee: Pt; ankle: Pt; toe: Pt };
  let legs: [Leg, Leg];
  let hip: Pt;
  if (stride > 0.001 && sit < 0.001) {
    // Walking: forward kinematics from the hip; the lower foot touches the floor.
    const ang = (o: number) => {
      const a = stride * 0.34 * Math.sin(ph + o);
      const k = stride * 0.5 * Math.max(0, Math.sin(ph + o - Math.PI / 2));
      return { a, b: a - k };
    };
    const A = ang(0);
    const B = ang(Math.PI);
    const ext = (g: { a: number; b: number }) => Math.cos(g.a) * T + Math.cos(g.b) * S;
    hip = { x: p.x + (p.shift ?? 0) * s, y: ankleY - Math.max(ext(A), ext(B)) };
    const leg = (g: { a: number; b: number }): Leg => {
      const knee = { x: hip.x - Math.sin(g.a) * T, y: hip.y + Math.cos(g.a) * T };
      const ankle = { x: knee.x - Math.sin(g.b) * S, y: knee.y + Math.cos(g.b) * S };
      return { hip, knee, ankle, toe: { x: ankle.x - L.foot * s, y: ankle.y + 4 * s } };
    };
    legs = [leg(A), leg(B)];
  } else {
    // Standing / sit-to-stand / heel raise: solved bottom-up from planted ankles.
    const a = (sit * Math.PI) / 2;
    const ankle = { x: p.x, y: ankleY };
    const knee = { x: ankle.x, y: ankle.y - S };
    hip = { x: knee.x + Math.sin(a) * T + (p.shift ?? 0) * s, y: knee.y - Math.cos(a) * T };
    const toe = { x: ankle.x - L.foot * s, y: p.floor - 2 * s };
    const leg: Leg = { hip, knee, ankle, toe };
    legs = [leg, { ...leg, knee: { x: knee.x + 8 * s, y: knee.y }, ankle: { x: ankle.x + 8 * s, y: ankle.y }, toe: { x: toe.x + 8 * s, y: toe.y } }];
  }
  // Torso leans forward during sit-to-stand (trunk flexion), upright otherwise.
  const lean = (p.lean ?? 0) + 0.55 * Math.sin(Math.PI * sit) + 0.05 * sit + stride * 0.04;
  const shoulder = { x: hip.x - Math.sin(lean) * L.torso * s, y: hip.y - Math.cos(lean) * L.torso * s };
  const head = { x: shoulder.x - Math.sin(lean) * (L.neck + L.head) * s, y: shoulder.y - Math.cos(lean) * (L.neck + L.head) * s };
  const U = L.upper * s;
  const F = L.fore * s;
  const arm = (o: number) => {
    const th = -stride * 0.38 * Math.sin(ph + o) + 0.05 + sit * 0.5;
    const elbow = { x: shoulder.x - Math.sin(th) * U, y: shoulder.y + Math.cos(th) * U };
    const wrist = { x: elbow.x - Math.sin(th + 0.3 + sit * 0.6) * F, y: elbow.y + Math.cos(th + 0.3 + sit * 0.6) * F };
    const amt = p.hands && (o === 0 || !p.oneHand) ? (p.handsAmt ?? 0) : 0;
    if (amt <= 0 || !p.hands) return { elbow, wrist };
    const target = { x: p.hands.x + o * 1.2, y: p.hands.y };
    const tw = { x: wrist.x + (target.x - wrist.x) * amt, y: wrist.y + (target.y - wrist.y) * amt };
    return { elbow: ik(shoulder, tw, U, F), wrist: tw };
  };
  return { s, legs, hip, shoulder, head, arms: [arm(Math.PI), arm(0)] as const };
};

const seg = (pts: Pt[]) => pts.map((q, i) => `${i ? "L" : "M"} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");

/** Faceless schematic figure in the series style: cream head/torso, charcoal limbs. */
export const Figure: React.FC<FigurePose & { readonly accent?: boolean }> = (p) => {
  const opacity = p.opacity ?? 1;
  if (opacity <= 0) return null;
  const f = solveFigure(p);
  const draw = p.draw ?? 1;
  const part = (i: number, n: number) => interpolate(draw * n - i, [0, 1], [0, 1], CLAMP);
  const limb = (pts: Pt[], i: number, back: boolean, key: string) => {
    const d = seg(pts);
    const e = evolvePath(part(i, 6), d);
    return (
      <path
        key={key}
        d={d}
        fill="none"
        stroke={BRAND.charcoal}
        strokeOpacity={back ? 0.5 : 1}
        strokeWidth={16 * f.s}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={e.strokeDasharray}
        strokeDashoffset={e.strokeDashoffset}
      />
    );
  };
  const [backLeg, frontLeg] = f.legs;
  const [backArm, frontArm] = f.arms;
  const tw = 46 * f.s;
  return (
    <g opacity={opacity}>
      {limb([backArm.wrist, backArm.elbow, f.shoulder].reverse(), 1, true, "ba")}
      {limb([f.hip, backLeg.knee, backLeg.ankle, backLeg.toe], 2, true, "bl")}
      {limb([f.hip, frontLeg.knee, frontLeg.ankle, frontLeg.toe], 3, false, "fl")}
      <g opacity={part(0, 6)}>
        <line
          x1={f.hip.x}
          y1={f.hip.y}
          x2={f.shoulder.x}
          y2={f.shoulder.y}
          stroke={BRAND.charcoal}
          strokeWidth={tw + 10 * f.s}
          strokeLinecap="round"
        />
        <line x1={f.hip.x} y1={f.hip.y} x2={f.shoulder.x} y2={f.shoulder.y} stroke={p.accent ? BRAND.beige : BRAND.offWhite} strokeWidth={tw} strokeLinecap="round" />
      </g>
      {limb([f.shoulder, frontArm.elbow, frontArm.wrist], 4, false, "fa")}
      <circle cx={f.head.x} cy={f.head.y} r={L.head * f.s} fill={BRAND.offWhite} stroke={BRAND.charcoal} strokeWidth={6 * f.s} opacity={part(5, 6)} />
    </g>
  );
};
