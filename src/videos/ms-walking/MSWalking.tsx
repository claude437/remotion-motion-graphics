import { Audio } from "@remotion/media";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CLAMP, EASE, track } from "../../lib/animation";
import { morphStates } from "../../lib/morph";
import { rrPath } from "../tayibat-ms/shapes";
import { ArLabel } from "../vitamin-d-ms-part2/components/ArLabel";
import { DoctorIcon } from "../vitamin-d-ms-part2/components/DoctorMonitoringPanel";
import { BrandBackground } from "../vitamin-d-ms/components/BrandBackground";
import { FilmGrain } from "../vitamin-d-ms/components/FilmGrain";
import { KineticText } from "../vitamin-d-ms/components/KineticText";
import { NerveMyelin } from "../vitamin-d-ms/components/NerveMyelin";
import { ARABIC_FONT, BRAND } from "../vitamin-d-ms/theme";
import { Figure, FigurePose, solveFigure } from "./components/Figure";
import {
  BalanceSymbol,
  Brain,
  Bubble,
  Cane,
  Chair,
  Muscle,
  PauseBadge,
  SupportBar,
  SymptomIcon,
  TopicCard,
  WallRail,
  Walker,
  walkerHandle,
} from "./components/Props";
import {
  ASSETS,
  HEADINGS,
  LAYOUT as L,
  SCENES,
  SFX,
  SceneId,
  sfxTime,
} from "./timeline";

const C = BRAND.charcoal;
const F = L.floor;
/** Scene start (s). Every cue below is written relative to a scene start. */
const T = Object.fromEntries(
  Object.entries(SCENES).map(([k, v]) => [k, v[0]]),
) as Record<SceneId, number>;

type Geo = { x: number; y: number; w: number; h: number };
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpGeo = (a: Geo, b: Geo, p: number): Geo => ({
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
  w: lerp(a.w, b.w, p),
  h: lerp(a.h, b.h, p),
});

/** Walk phase from the travelled distance, so feet don't slide. */
const phaseAt = (x: number, s: number) => (1000 - x) / (215 * s);

/** Poll card geometry and the external outline around the «صعوبة المشي — 26%» row. */
const POLL_IMG_W = L.pollCard.w - 40;
const POLL_K = POLL_IMG_W / ASSETS.poll.w;
const POLL_IMG_H = ASSETS.poll.h * POLL_K;
const ROW = ASSETS.walkingRow;
const OUTLINE_GAP = 5;
const OUTLINE = {
  x: L.pollCard.x - POLL_IMG_W / 2 + (ROW.x + ROW.w / 2) * POLL_K,
  y: L.pollCard.y - POLL_IMG_H / 2 + (ROW.y + ROW.h / 2) * POLL_K,
  w: ROW.w * POLL_K + OUTLINE_GAP * 2,
  h: ROW.h * POLL_K + OUTLINE_GAP * 2,
};

/** Simplified CNS motor pathway: brain → spinal cord → thigh muscle. */
const CORD = `M ${L.brain.x} ${L.brain.y + 78} L ${L.brain.x} ${L.cordBottom - 25}`;
const MOTOR = `M ${L.brain.x} ${L.cordBottom - 25} C ${L.brain.x} ${L.cordBottom + 60} 560 1040 470 1040`;
const SIGNAL_PATH = `M ${L.brain.x} ${L.brain.y + 40} L ${L.brain.x} ${L.cordBottom - 25} C ${L.brain.x} ${L.cordBottom + 60} 560 1040 470 1040`;
const SIGNAL_LEN = getLength(SIGNAL_PATH);
const LENS_SOURCE = { x: 588, y: 1004 };

export const MSWalking: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = (
    keys: ReadonlyArray<readonly [number, number]>,
    easing: (x: number) => number = EASE.inOut,
  ) => track(frame, fps, keys, easing);
  const sp = (at: number, damping = 200) =>
    spring({ frame: frame - at * fps, fps, config: { damping, stiffness: 120 } });
  /** 0 → 1 → 0 visibility window. */
  const win = (a: number, b: number, fi = 0.3, fo = 0.3) =>
    interpolate(t, [a, a + fi, b, b + fo], [0, 1, 1, 0], CLAMP);
  const f = (s: number) => Math.round(s * fps);

  // ---------- Original image card (header ↔ poll), HTML ----------
  const hz = L.headerZoom;
  const fullK = (L.headerCard.w - 40) / ASSETS.header.w;
  const zoomIn = k([[T.page + 0.8, 0], [T.page + 1.4, 1]]);
  const toPoll = k([[T.poll - 0.55, 0], [T.poll + 0.05, 1]]);
  const inFollow = t >= T.support + 1.5;
  let card = lerpGeo(
    lerpGeo(L.headerCard, L.headerCardZoom, zoomIn),
    L.pollCard,
    toPoll,
  );
  if (inFollow) card = L.headerCardFollow;
  const cardIn = inFollow
    ? k([[T.follow - 0.15, 0], [T.follow + 0.1, 1]])
    : sp(T.page + 0.1);
  const cardOut = inFollow
    ? k([[T.move - 0.45, 0], [T.move - 0.25, 1]])
    : k([[T.series - 0.6, 0], [T.series - 0.15, 1]]);
  const cardOpacity = interpolate(cardIn, [0, 0.5], [0, 1], CLAMP) * (1 - cardOut);
  const cardScale =
    interpolate(cardIn, [0, 1], [0.9, 1]) * (inFollow ? 1 : 1 - 0.05 * cardOut);
  const headerZoom = inFollow ? 1 : zoomIn;
  const headerK = lerp(fullK, hz.scale, headerZoom);
  const headerFocus = {
    x: lerp(ASSETS.header.w / 2, hz.x, headerZoom),
    y: lerp(ASSETS.header.h / 2, hz.y, headerZoom),
  };
  const headerOpacity = inFollow ? 1 : 1 - k([[T.poll - 0.55, 0], [T.poll - 0.3, 1]]);
  const pollIn = inFollow ? 0 : k([[T.poll - 0.2, 0], [T.poll + 0.15, 1]], EASE.out);

  // ---------- Outline → pathway (the poll row frame becomes the series line) ----------
  const outlineDraw = k([[T.poll + 0.6, 0], [T.poll + 1.05, 1]], EASE.out);
  const toLine = k([[T.series - 0.55, 0], [T.series + 0.1, 1]]);
  const line = lerpGeo(OUTLINE, { x: 500, y: L.topicCards[0].y, w: 760, h: 0 }, toLine);
  const outlineR = lerp(18, 0, toLine);
  const lineFade = 1 - k([[T.signal - 0.45, 0], [T.signal - 0.1, 1]]);
  const outlineLift = win(T.series - 0.6, T.series - 0.35, 0.15, 0.25);
  // Once the poll card has gone, the line moves to the stage layer (behind the topic cards).
  const lineInStage = t >= T.series - 0.1;

  // ---------- Ground: the persistent pathway the figure walks on ----------
  const ground = morphStates(t, [
    { move: [0, 0], state: { x1: 745, x2: 745, y: F, o: 0 } },
    { move: [T.series + 1.0, T.series + 1.5], state: { x1: 120, x2: 880, y: F, o: 1 } },
    { move: [T.signal - 0.05, T.signal + 0.35], state: { x1: 440, x2: 440, y: F, o: 1 } },
    { move: [T.signal + 0.35, T.signal + 0.4], state: { x1: 440, x2: 440, y: F, o: 0 } },
    { move: [T.symptoms + 0.1, T.symptoms + 0.6], state: { x1: 300, x2: 580, y: F, o: 1 } },
    { move: [T.support - 0.45, T.support + 0.1], state: { x1: 470, x2: 770, y: 1150, o: 1 } },
    { move: [T.follow - 0.55, T.follow], state: { x1: 650, x2: 880, y: F, o: 1 } },
    { move: [T.move - 0.45, T.move + 0.1], state: { x1: 120, x2: 880, y: F, o: 1 } },
    { move: [T.next - 0.35, T.next + 0.25], state: { x1: 120, x2: 880, y: L.nextCards.y, o: 1 } },
  ]);
  const trackMarks = win(T.move, T.balance - 0.1, 0.35, 0.3);
  const stableFloor = win(T.balance, T.context - 0.15, 0.4, 0.4);

  // ---------- Series topic cards ----------
  const cardsSeries = 1 - k([[T.signal - 0.45, 0], [T.signal - 0.1, 1]]);
  const card1Active = k([[T.series + 0.35, 0], [T.series + 0.55, 1]]);
  const dropDraw = k([[T.series + 0.8, 0], [T.series + 1.05, 1]]);

  // ---------- CNS pathway (signal → disrupted → symptoms) ----------
  const cnsDim = k([
    [T.disrupted + 0.1, 1],
    [T.disrupted + 0.5, 0.25],
    [T.symptoms - 0.45, 0.25],
    [T.symptoms + 0.05, 1],
    [T.symptoms + 0.6, 1],
    [T.symptoms + 1.0, 0],
  ]);
  const brainDraw = k([[T.signal + 0.15, 0], [T.signal + 0.75, 1]], EASE.out);
  const cordDraw = k([[T.signal + 0.3, 0], [T.signal + 0.7, 1]], EASE.out);
  const motorDraw = k([[T.signal + 0.5, 0], [T.signal + 0.9, 1]], EASE.out);
  const pulses = [
    [T.signal + 0.9, T.signal + 1.75],
    [T.signal + 1.95, T.signal + 2.8],
    [T.symptoms + 0.05, T.symptoms + 0.55],
  ] as const;
  const muscleBump = pulses.reduce(
    (m, [, b]) => Math.max(m, win(b - 0.05, b + 0.05, 0.08, 0.3)),
    0,
  );

  // ---------- Lens + nerve (disrupted) ----------
  const lens = morphStates(t, [
    { move: [0, 0], state: { x: LENS_SOURCE.x, y: LENS_SOURCE.y, r: 0 } },
    { move: [T.disrupted + 0.05, T.disrupted + 0.7], state: { x: L.lens.x, y: L.lens.y, r: L.lens.r } },
    { move: [T.symptoms - 0.5, T.symptoms + 0.05], state: { x: LENS_SOURCE.x, y: LENS_SOURCE.y, r: 0 } },
  ]);
  const lensK = lens.r / L.lens.r;
  const nerveDraw = k([[T.disrupted + 0.4, 0], [T.disrupted + 0.95, 1]], EASE.out);
  const nerveMyelin = k([[T.disrupted + 0.6, 0], [T.disrupted + 1.1, 1]], EASE.out);
  const damages = [
    { index: 2, amount: k([[T.disrupted + 1.1, 0], [T.disrupted + 1.7, 0.85]]) },
    { index: 3, amount: k([[T.disrupted + 1.3, 0], [T.disrupted + 1.9, 0.6]]) },
  ];
  const nervePulse = k(
    [
      [T.disrupted + 0.95, 0],
      [T.disrupted + 1.45, 0.42],
      [T.disrupted + 2.1, 0.5],
      [T.disrupted + 2.4, 0.62],
      [T.disrupted + 2.75, 0.98],
    ],
    (x) => x,
  );
  const nervePulseOn = t > T.disrupted + 0.95 && t < T.disrupted + 2.8;
  const stall = win(T.disrupted + 1.5, T.disrupted + 2.1, 0.2, 0.25);

  // ---------- Symptoms ----------
  const icons = [
    { kind: "weak", x: 650, y: 960, label: "ضعف" },
    { kind: "stiff", x: 210, y: 960, label: "تيبّس" },
    { kind: "sway", x: 650, y: 1170, label: "توازن" },
    { kind: "lift", x: 210, y: 1170, label: "رفع القدم" },
  ] as const;
  const iconAt = (i: number) => T.symptoms + 0.55 + i * 0.5;
  const iconsOut = k([[T.support - 0.45, 0], [T.support - 0.05, 1]]);
  const iconTargets = [
    { x: 300, y: 1000 },
    { x: 300, y: 1000 },
    { x: 300, y: 800 },
    { x: 300, y: 800 },
  ];

  // ---------- Rehab card → page card (SVG panel) ----------
  const rehabIn = k([[T.support - 0.4, 0], [T.support + 0.15, 1]]);
  const toFollow = k([[T.follow - 0.55, 0], [T.follow, 1]]);
  const panel = lerpGeo(
    lerpGeo({ x: 440, y: 1000, w: 220, h: 220 }, L.rehabCard, rehabIn),
    L.headerCardFollow,
    toFollow,
  );
  const panelOpacity = win(T.support - 0.4, T.follow + 0.05, 0.15, 0.15);
  const rehabContent = win(T.support, T.follow - 0.65, 0.35, 0.2);

  // ---------- Card edge → walking track (overlay shell) ----------
  const toTrack = k([[T.move - 0.45, 0], [T.move + 0.1, 1]]);
  const shell = lerpGeo(L.headerCardFollow, { x: 500, y: F, w: 760, h: 0 }, toTrack);
  const shellOn = t > T.move - 0.5 && t < T.move + 0.12;

  // ---------- Chair + rail ----------
  const propsOut = 1 - k([[T.context - 0.3, 0], [T.context + 0.1, 1]]);
  const chairDraw = k([[T.balance, 0], [T.balance + 0.5, 1]], EASE.out);
  const railDraw = k([[T.strength + 1.1, 0], [T.strength + 1.5, 1]], EASE.out);

  // ---------- The figure ----------
  const pose = ((): FigurePose & { oneHand?: boolean } => {
    const base = { x: 640, floor: F, scale: 1, draw: 1, opacity: 1 };
    if (t < T.effort) {
      return { ...base, draw: k([[T.series + 1.2, 0], [T.series + 1.95, 1]], EASE.out) };
    }
    if (t < T.signal) {
      const x = k([[T.effort, 640], [T.effort + 0.9, 545], [T.effort + 1.3, 545], [T.effort + 1.95, 440]]);
      const stride = k([
        [T.effort, 0], [T.effort + 0.15, 0.8], [T.effort + 0.75, 0.8], [T.effort + 0.95, 0],
        [T.effort + 1.3, 0], [T.effort + 1.42, 0.8], [T.effort + 1.82, 0.8], [T.effort + 1.98, 0],
      ]);
      return { ...base, x, stride, phase: phaseAt(x, 1) };
    }
    if (t < T.support - 0.45) {
      const swayAt = iconAt(2);
      const shift = 7 * Math.sin(((t - swayAt) / 1.1) * Math.PI * 2) * win(swayAt, T.support - 0.6, 0.2, 0.2);
      const dim = k([[T.disrupted + 0.1, 1], [T.disrupted + 0.5, 0.3], [T.symptoms - 0.45, 0.3], [T.symptoms + 0.05, 1]]);
      return { ...base, x: 440, shift, opacity: dim };
    }
    if (t < T.follow - 0.55) {
      const m = k([[T.support - 0.45, 0], [T.support + 0.3, 1]]);
      const x = t < T.support + 0.3 ? lerp(440, 650, m) : k([[T.support + 0.3, 650], [T.support + 1.4, 600]], (v) => v);
      const s = lerp(1, 0.62, m);
      const stride = k([[T.support + 0.3, 0], [T.support + 0.45, 0.5], [T.support + 1.25, 0.5], [T.support + 1.4, 0]]);
      return {
        ...base, x, floor: lerp(F, 1150, m), scale: s, stride, phase: phaseAt(x, s),
        hands: { x: x - 32, y: 1012 }, handsAmt: k([[T.support + 0.15, 0], [T.support + 0.5, 1]]),
      };
    }
    if (t < T.move) {
      const m = k([[T.follow - 0.55, 0], [T.follow, 1]]);
      return {
        ...base, x: lerp(600, 790, m), floor: lerp(1150, F, m), scale: lerp(0.62, 1, m),
        hands: { x: 568, y: 1012 }, handsAmt: 1 - k([[T.follow - 0.55, 0], [T.follow - 0.3, 1]]),
      };
    }
    if (t < T.balance) {
      const x = k([[T.move, 790], [T.move + 0.8, 660], [T.move + 1.3, 660], [T.move + 1.95, 560]]);
      const stride = k([
        [T.move, 0], [T.move + 0.15, 0.8], [T.move + 0.65, 0.8], [T.move + 0.85, 0],
        [T.move + 1.3, 0], [T.move + 1.42, 0.8], [T.move + 1.82, 0.8], [T.move + 1.98, 0],
      ]);
      return { ...base, x, stride, phase: phaseAt(x, 1) };
    }
    const swap = T.strength + 0.2;
    if (t < swap) {
      const shift = 12 * Math.sin(((t - T.balance - 0.8) / 1.1) * Math.PI * 2) * win(T.balance + 0.8, T.balance + 1.75, 0.15, 0.2);
      return {
        ...base, x: 560, shift,
        hands: { x: L.chair + 62, y: F - 292 },
        handsAmt: k([[T.balance + 0.3, 0], [T.balance + 0.7, 1]]),
        opacity: 1 - k([[T.strength - 0.05, 0], [swap, 1]]),
      };
    }
    if (t < T.context + 0.4) {
      const m = k([[T.context, 0], [T.context + 0.4, 1]]);
      return {
        ...base,
        x: lerp(335, 495, m),
        scale: lerp(1, 0.82, m),
        sit: k([[swap, 1], [T.strength + 0.55, 1], [T.strength + 1.5, 0]]),
        heel: k([[T.strength + 1.95, 0], [T.strength + 2.3, 1], [T.strength + 2.45, 1], [T.strength + 2.75, 0]]),
        hands: { x: L.railX + 45, y: F - 265 },
        handsAmt: k([[T.strength + 1.5, 0], [T.strength + 1.85, 1], [T.context - 0.4, 1], [T.context - 0.1, 0]]),
        opacity: k([[swap, 0], [T.strength + 0.45, 1]]),
      };
    }
    if (t < T.doctor) {
      const x = k([[T.context + 0.9, 495], [T.doctor - 0.1, 445]], (v) => v);
      const s = 0.82;
      return {
        ...base, x, scale: s,
        stride: k([[T.context + 0.9, 0], [T.context + 1.1, 0.5], [T.doctor - 0.3, 0.5], [T.doctor - 0.1, 0]]),
        phase: phaseAt(x, s), oneHand: true,
        hands: { x: x - 40, y: F - 170 }, handsAmt: k([[T.context + 0.5, 0], [T.context + 0.85, 1]]),
      };
    }
    if (t < T.next - 0.35) {
      const m = k([[T.doctor, 0], [T.doctor + 0.5, 1]]);
      return {
        ...base, x: lerp(445, 330, m), scale: lerp(0.82, 1, m), oneHand: true,
        hands: { x: 405, y: F - 170 }, handsAmt: 1 - m,
      };
    }
    const m = k([[T.next - 0.35, 0], [T.next + 0.25, 1]]);
    return {
      ...base, x: lerp(330, L.nextCards.xs[0] + 5, m), floor: lerp(F, L.nextCards.y + 70, m), scale: lerp(1, 0.36, m),
    };
  })();
  const fig = solveFigure(pose);
  const figLate =
    (t >= T.support - 0.45 && t < T.context + 0.4) || t >= T.next - 0.35;
  const caneOn = win(T.context + 0.5, T.doctor + 0.05, 0.3, 0.3);

  // Clones for "not every patient": free walker (right) and walker frame (left).
  const cloneVis = win(T.context + 0.4, T.doctor, 0.3, 0.35);
  const freeX = k([[T.context + 0.4, 495], [T.context + 0.9, 760], [T.doctor - 0.1, 640], [T.doctor + 0.3, 400]]);
  const walkerX = k([[T.context + 0.4, 495], [T.context + 0.9, 235], [T.doctor - 0.1, 212], [T.doctor + 0.3, 300]]);
  const walkStride = (amt: number) =>
    k([[T.context + 0.9, 0], [T.context + 1.1, amt], [T.doctor - 0.3, amt], [T.doctor - 0.1, 0]]);

  // ---------- Doctor / comments ----------
  const markerP = sp(T.doctor + 0.3, 12);
  const markerVis = win(T.doctor + 0.3, T.comments - 0.35, 0.1, 0.3);
  const linkDraw = k([[T.doctor + 0.55, 0], [T.doctor + 1.0, 1]], EASE.out);
  const contact = morphStates(t, [
    { move: [0, 0], state: { x: 695, y: 950, w: 60, h: 60, o: 0 } },
    { move: [T.doctor + 0.85, T.doctor + 1.25], state: { ...L.contactCard, o: 1 } },
    { move: [T.comments - 0.35, T.comments + 0.05], state: { ...L.bubble, o: 1 } },
    { move: [T.comments + 0.05, T.comments + 0.15], state: { ...L.bubble, o: 0 } },
  ]);
  const doctorP = t < T.comments - 0.35 ? sp(T.doctor + 1.0) : 1 - k([[T.comments - 0.35, 0], [T.comments - 0.15, 1]]);
  const commentsOut = 1 - k([[T.next - 0.4, 0], [T.next - 0.1, 1]]);
  const mainBubbleP = t < T.comments ? 0 : k([[T.comments, 0.85], [T.comments + 0.15, 1]]);

  // ---------- Next episode ----------
  const nextCardP = (i: number) => sp(T.next - 0.15 + i * 0.1);
  const nextActive = k([[T.next, 0], [T.next + 0.3, 1], [T.next + 1.0, 0.6]]);
  const nextGlow = k([[T.next + 0.65, 0], [T.next + 1.2, 1]]) * (0.88 + 0.12 * Math.sin((t - T.next) * 2.4));

  const pulseDot = (p: { x: number; y: number }, key: string, o = 1) => (
    <g key={key} opacity={o}>
      <circle cx={p.x} cy={p.y} r={26} fill={BRAND.offWhite} opacity={0.35} />
      <circle cx={p.x} cy={p.y} r={13} fill={BRAND.offWhite} stroke={C} strokeWidth={4} />
    </g>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.orange, fontFamily: ARABIC_FONT }}>
      <BrandBackground
        frame={frame}
        fps={fps}
        width={width}
        height={height}
        focus={[
          [0, 820], [T.poll, 925], [T.series, 760], [T.effort, 1000], [T.signal, 850],
          [T.disrupted, 915], [T.symptoms, 1060], [T.support, 915], [T.follow, 700],
          [T.move, 1050], [T.context, 1040], [T.doctor, 950], [T.next, 860], [SCENES.next[1], 860],
        ]}
        morphTimes={Object.values(T).map((s) => s + 0.5)}
      />

      {/* ---------- Vector stage ---------- */}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute" }}>
        <defs>
          <filter id="mw-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx={0} dy={22} stdDeviation={24} floodColor={BRAND.orangeShadow} floodOpacity={0.5} />
          </filter>
          <clipPath id="mw-lens">
            <circle cx={lens.x} cy={lens.y} r={Math.max(0, lens.r - 4)} />
          </clipPath>
        </defs>

        {/* Stable floor (balance + strength) */}
        {stableFloor > 0 ? (
          <rect x={120} y={F} width={760} height={34} rx={10} fill={BRAND.beige} opacity={stableFloor} />
        ) : null}

        {/* Ground pathway */}
        {ground.o > 0 && ground.x2 - ground.x1 > 0.5 ? (
          <line x1={ground.x1} y1={ground.y} x2={ground.x2} y2={ground.y} stroke={C} strokeWidth={8} strokeLinecap="round" opacity={ground.o} />
        ) : null}
        {trackMarks > 0
          ? Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={150 + i * 62} y={F + 16} width={30} height={8} rx={4} fill={BRAND.offWhite} opacity={trackMarks * 0.9} />
            ))
          : null}

        {/* Series line + topic cards */}
        {lineInStage && lineFade > 0 ? (
          <line x1={line.x - line.w / 2} y1={line.y} x2={line.x + line.w / 2} y2={line.y} stroke={C} strokeWidth={7} strokeLinecap="round" opacity={lineFade} />
        ) : null}
        {cardsSeries > 0 && dropDraw > 0 ? (
          <line
            x1={L.topicCards[0].x}
            y1={L.topicCards[0].y + 75}
            x2={L.topicCards[0].x}
            y2={lerp(L.topicCards[0].y + 75, F, dropDraw)}
            stroke={C}
            strokeWidth={6}
            strokeDasharray="4 16"
            strokeLinecap="round"
            opacity={cardsSeries}
          />
        ) : null}
        {cardsSeries > 0
          ? L.topicCards.map((c, i) => (
              <TopicCard
                key={i}
                x={c.x}
                y={c.y}
                w={L.topicCard.w}
                h={L.topicCard.h}
                p={sp(T.series + 0.05 + i * 0.12)}
                active={i === 0 ? card1Active : 0}
                glyph={i === 0 && card1Active > 0}
                opacity={cardsSeries}
              />
            ))
          : null}
        {cardsSeries > 0 && card1Active > 0 ? (
          <Figure x={L.topicCards[0].x + 5} floor={L.topicCards[0].y + 60} scale={0.3} opacity={card1Active * cardsSeries} />
        ) : null}

        {/* CNS pathway */}
        {brainDraw > 0 && cnsDim > 0 ? (
          <g opacity={cnsDim}>
            <Brain x={L.brain.x} y={L.brain.y} draw={brainDraw} />
            {(() => {
              const e = evolvePath(cordDraw, CORD);
              return (
                <g>
                  <path d={CORD} stroke={C} strokeWidth={34} strokeLinecap="round" fill="none" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
                  <path d={CORD} stroke={BRAND.beige} strokeWidth={22} strokeLinecap="round" fill="none" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
                </g>
              );
            })()}
            {(() => {
              const e = evolvePath(motorDraw, MOTOR);
              return <path d={MOTOR} stroke={C} strokeWidth={8} strokeLinecap="round" fill="none" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
            })()}
          </g>
        ) : null}

        {/* Figure (main layer) */}
        {figLate ? null : <Figure {...pose} />}
        {caneOn > 0 ? <Cane hand={{ x: fig.arms[1].wrist.x, y: fig.arms[1].wrist.y }} floor={F} opacity={caneOn} /> : null}

        {/* Muscle on the thigh + signal pulses */}
        {motorDraw > 0 && cnsDim > 0 ? (
          <Muscle
            x={fig.hip.x + (fig.legs[1].knee.x - fig.hip.x) * 0.5 + 6}
            y={fig.hip.y + (fig.legs[1].knee.y - fig.hip.y) * 0.5}
            s={0.62 * (1 + 0.14 * muscleBump)}
            rot={90}
            opacity={cnsDim * interpolate(motorDraw, [0.7, 1], [0, 1], CLAMP)}
          />
        ) : null}
        {pulses.map(([a, b], i) => {
          if (t < a || t > b + 0.1) return null;
          const p = interpolate(t, [a, b], [0, 1], { ...CLAMP, easing: EASE.inOut });
          const pt = getPointAtLength(SIGNAL_PATH, p * SIGNAL_LEN);
          return pt ? pulseDot(pt, `pulse-${i}`, interpolate(t, [b, b + 0.1], [1, 0], CLAMP)) : null;
        })}

        {/* Clones: different walking abilities */}
        {cloneVis > 0 ? (
          <g>
            <Figure x={freeX} floor={F} scale={0.82} stride={walkStride(0.8)} phase={phaseAt(freeX, 0.82)} opacity={cloneVis} />
            <Walker x={walkerX - 75} floor={F} scale={0.82} opacity={cloneVis} />
            <Figure
              x={walkerX}
              floor={F}
              scale={0.82}
              stride={walkStride(0.35)}
              phase={phaseAt(walkerX, 0.82)}
              hands={walkerHandle(walkerX - 75, F, 0.82)}
              handsAmt={k([[T.context + 0.7, 0], [T.context + 1.0, 1]])}
              opacity={cloneVis}
            />
          </g>
        ) : null}

        {/* Effort pulses around the legs (respectful, soft) */}
        {[T.effort + 0.35, T.effort + 0.95, T.effort + 1.55].map((a, i) => {
          const p = interpolate(t, [a, a + 0.7], [0, 1], CLAMP);
          if (p <= 0 || p >= 1) return null;
          return (
            <g key={`effort-${i}`} opacity={(1 - p) * 0.9}>
              {fig.legs.map((leg, j) => (
                <circle key={j} cx={leg.knee.x} cy={leg.knee.y + 20} r={30 + 55 * p} fill="none" stroke={BRAND.offWhite} strokeWidth={5} />
              ))}
            </g>
          );
        })}

        {/* Lens with the magnified nerve */}
        {lens.r > 1 ? (
          <g>
            <circle cx={LENS_SOURCE.x} cy={LENS_SOURCE.y} r={24} fill="none" stroke={BRAND.offWhite} strokeWidth={5} opacity={lensK} />
            <circle cx={lens.x} cy={lens.y} r={lens.r} fill={BRAND.offWhite} stroke={C} strokeWidth={7} filter="url(#mw-shadow)" />
            <g clipPath="url(#mw-lens)">
              <NerveMyelin
                x={lens.x}
                y={lens.y}
                width={600 * lensK}
                draw={nerveDraw}
                myelin={nerveMyelin}
                wave={0.6}
                phase={t * 0.8}
                damages={damages}
                pulses={nervePulseOn ? [nervePulse] : []}
                opacity={interpolate(lensK, [0.5, 0.9], [0, 1], CLAMP)}
              />
            </g>
            <PauseBadge x={lens.x - 20} y={lens.y - 120} p={stall} />
          </g>
        ) : null}

        {/* Symptom icons (possible effects) */}
        {icons.map((ic, i) => {
          const p = sp(iconAt(i), 14);
          if (p <= 0 || iconsOut >= 1) return null;
          const tx = lerp(ic.x, iconTargets[i].x, iconsOut);
          const ty = lerp(ic.y, iconTargets[i].y, iconsOut);
          return (
            <g key={ic.kind} transform={`translate(${tx} ${ty}) scale(1.3) translate(${-tx} ${-ty})`}>
              <SymptomIcon kind={ic.kind} x={tx} y={ty} p={p} t={t} opacity={1 - iconsOut} />
            </g>
          );
        })}

        {/* Rehab card → page card panel */}
        {panelOpacity > 0 ? (
          <g opacity={panelOpacity}>
            <path d={rrPath(panel.x, panel.y, panel.w, panel.h, 40)} fill={BRAND.offWhite} filter="url(#mw-shadow)" />
            <g opacity={rehabContent}>
              <line x1={420} y1={700} x2={420} y2={1130} stroke={BRAND.gray} strokeWidth={4} strokeLinecap="round" />
              <BalanceSymbol x={265} y={800} s={1} t={t} />
              <Muscle x={265} y={1010} s={1.15} rot={-20} />
              <SupportBar x1={470} x2={770} y={1012} floor={1150} />
            </g>
          </g>
        ) : null}

        {/* Chair + wall rail */}
        <Chair cx={L.chair} floor={F} draw={chairDraw} opacity={propsOut} />
        <WallRail x={L.railX} floor={F} draw={railDraw} opacity={propsOut} />

        {/* Pause badge during the "move" routine */}
        <PauseBadge x={660} y={745} p={win(T.move + 0.85, T.move + 1.25, 0.2, 0.2)} />

        {/* Doctor: symptom marker on the pathway → contact card */}
        {markerVis > 0 ? (
          <g opacity={markerVis}>
            {(() => {
              const d = `M 520 ${F - 26} C 520 1080 ${L.contactCard.x} 1080 ${L.contactCard.x} ${L.contactCard.y + L.contactCard.h / 2 + 4}`;
              const e = evolvePath(linkDraw, d);
              return <path d={d} fill="none" stroke={C} strokeWidth={6} strokeLinecap="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
            })()}
            {[0, 0.6].map((o) => {
              const p = ((t - T.doctor - 0.4 - o) / 1.2) % 1;
              return p > 0 ? <circle key={o} cx={520} cy={F} r={24 + 40 * p} fill="none" stroke={BRAND.offWhite} strokeWidth={4} opacity={1 - p} /> : null;
            })}
            <g transform={`translate(520 ${F}) scale(${markerP})`}>
              <circle r={34} fill={BRAND.orangeBright} stroke={C} strokeWidth={6} />
              <rect x={-4.5} y={-19} width={9} height={23} rx={4.5} fill={BRAND.offWhite} />
              <circle cx={0} cy={13} r={5.5} fill={BRAND.offWhite} />
            </g>
          </g>
        ) : null}
        {contact.o > 0 ? (
          <g opacity={contact.o}>
            <path d={rrPath(contact.x, contact.y, contact.w, contact.h, 36)} fill={BRAND.offWhite} filter="url(#mw-shadow)" />
            <DoctorIcon x={L.contactCard.x} y={L.contactCard.y - 30} p={doctorP} />
            <g opacity={interpolate(doctorP, [0.5, 1], [0, 1], CLAMP)}>
              <rect x={L.contactCard.x - 70} y={L.contactCard.y + 74} width={140} height={14} rx={7} fill={BRAND.gray} />
              <rect x={L.contactCard.x - 45} y={L.contactCard.y + 100} width={90} height={14} rx={7} fill={BRAND.gray} />
            </g>
          </g>
        ) : null}

        {/* Comment bubbles (abstract, no testimonials) */}
        <Bubble x={L.bubble.x} y={L.bubble.y} w={L.bubble.w} h={L.bubble.h} p={mainBubbleP} tail="left" kind="question" opacity={commentsOut} />
        <Bubble x={655} y={1000} w={300} h={110} p={sp(T.comments + 0.55)} tail="right" kind="lines" opacity={commentsOut} />
        <Bubble x={700} y={1135} w={300} h={110} p={sp(T.comments + 0.95)} tail="right" kind="lines" opacity={commentsOut} />

        {/* Next episode cards */}
        {t > T.next - 0.3
          ? L.nextCards.xs.map((x, i) => (
              <TopicCard
                key={`next-${i}`}
                x={x}
                y={L.nextCards.y}
                w={L.nextCards.w}
                h={L.nextCards.h}
                p={nextCardP(i)}
                active={i === 0 ? nextActive : 0}
                glow={i === 1 ? nextGlow : 0}
                glyph={i === 0}
              />
            ))
          : null}
        {/* Figure in front of the rehab card / chair / topic cards */}
        {figLate ? <Figure {...pose} /> : null}
      </svg>

      {/* ---------- Original images in off-white cards (never redrawn or recolored) ---------- */}
      {cardOpacity > 0 ? (
        <div
          style={{
            position: "absolute",
            left: card.x - card.w / 2,
            top: card.y - card.h / 2,
            width: card.w,
            height: card.h,
            borderRadius: 36,
            backgroundColor: BRAND.offWhite,
            boxShadow: `0 22px 48px ${BRAND.orangeShadow}88`,
            overflow: "hidden",
            opacity: cardOpacity,
            scale: String(cardScale),
          }}
        >
          {headerOpacity > 0 ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: headerOpacity,
                maskImage: `linear-gradient(to right, black ${100 - 16 * headerZoom}%, transparent ${100 - 2 * headerZoom}%)`,
              }}
            >
              <Img
                src={staticFile(ASSETS.header.src)}
                style={{
                  position: "absolute",
                  left: card.w / 2 - headerFocus.x * headerK,
                  top: card.h / 2 - headerFocus.y * headerK,
                  width: ASSETS.header.w * headerK,
                  height: ASSETS.header.h * headerK,
                  borderRadius: 14,
                }}
              />
            </div>
          ) : null}
          {pollIn > 0 ? (
            <Img
              src={staticFile(ASSETS.poll.src)}
              style={{
                position: "absolute",
                left: card.w / 2 - POLL_IMG_W / 2,
                top: card.h / 2 - POLL_IMG_H / 2,
                width: POLL_IMG_W,
                height: POLL_IMG_H,
                opacity: pollIn,
                scale: String(lerp(0.96, 1, pollIn)),
                borderRadius: 14,
              }}
            />
          ) : null}
        </div>
      ) : null}

      {/* ---------- Overlay: question bubble, row outline → pathway, card → track ---------- */}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute" }}>
        <Bubble
          x={780}
          y={595}
          w={150}
          h={110}
          p={t < T.poll - 0.6 ? sp(T.page + 1.7, 14) : 1 - k([[T.poll - 0.6, 0], [T.poll - 0.4, 1]])}
          tail="left"
          kind="question"
        />
        {outlineDraw > 0 && lineFade > 0 && !lineInStage ? (
          (() => {
            const d = rrPath(line.x, line.y - 10 * outlineLift, line.w, line.h, outlineR);
            const e = evolvePath(outlineDraw, d);
            return (
              <path
                d={d}
                fill="none"
                stroke={toLine > 0.5 ? C : BRAND.orangeBright}
                strokeWidth={toLine > 0.5 ? 7 : 6}
                strokeLinejoin="round"
                strokeDasharray={e.strokeDasharray}
                strokeDashoffset={e.strokeDashoffset}
                opacity={lineFade}
              />
            );
          })()
        ) : null}
        {shellOn ? (
          <path
            d={rrPath(shell.x, shell.y, shell.w, shell.h, lerp(36, 0, toTrack))}
            fill={BRAND.offWhite}
            fillOpacity={1 - toTrack}
            stroke={C}
            strokeWidth={lerp(5, 8, toTrack)}
          />
        ) : null}
      </svg>

      {/* ---------- Symptom labels ---------- */}
      {icons.map((ic, i) => (
        <ArLabel
          key={ic.kind}
          x={ic.x}
          y={ic.y + 80}
          text={ic.label}
          progress={sp(iconAt(i) + 0.1)}
          opacity={1 - k([[T.support - 0.55, 0], [T.support - 0.35, 1]])}
          size={46}
          weight={700}
        />
      ))}

      {/* ---------- Headings ---------- */}
      {HEADINGS.map((h, i) => (
        <KineticText
          key={i}
          frame={frame}
          fps={fps}
          inAt={SCENES[h.scene][0] + h.in}
          outAt={h.out === undefined ? undefined : SCENES[h.until ?? h.scene][1] + h.out}
          top={L.textTop}
          left={90}
          right={180}
          fontFamily={ARABIC_FONT}
          lines={[
            { text: h.title, size: h.size ?? 84, weight: 700 },
            ...(h.small ? [{ text: h.small, size: 46, weight: 600 as const }] : []),
          ]}
        />
      ))}

      <FilmGrain frame={frame} width={width} height={height} animated={false} />

      {/* ---------- Optional subtle SFX (also rendered as a separate stem) ---------- */}
      {SFX.map((c, i) => (
        <Audio
          key={i}
          name={`${c.sound} – ${c.label}`}
          src={staticFile(`audio/${c.sound}.mp3`)}
          from={f(sfxTime(c))}
          premountFor={fps}
          volume={c.volume}
        />
      ))}
    </AbsoluteFill>
  );
};
