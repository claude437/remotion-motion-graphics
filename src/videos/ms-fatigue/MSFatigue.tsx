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
import { Bubble, Chair, TopicCard } from "../ms-walking/components/Props";
import { Figure, solveFigure } from "../ms-walking/components/Figure";
import { ArLabel } from "../vitamin-d-ms-part2/components/ArLabel";
import { DoctorIcon } from "../vitamin-d-ms-part2/components/DoctorMonitoringPanel";
import { BrandBackground } from "../vitamin-d-ms/components/BrandBackground";
import { FilmGrain } from "../vitamin-d-ms/components/FilmGrain";
import { KineticText } from "../vitamin-d-ms/components/KineticText";
import { ARABIC_FONT, BRAND } from "../vitamin-d-ms/theme";
import {
  Anchor,
  Badge,
  Battery,
  Bed,
  Calendar,
  CardShape,
  DropGlyph,
  Drawn,
  Fan,
  HeatGlyph,
  MoonGlyph,
  Node,
  PainGlyph,
  PillGlyph,
  Pop,
  Sofa,
  Steps,
  SunWindow,
  ThyroidGlyph,
  VitaminGlyph,
} from "./components/Board";
import { ASSETS, HEADINGS, LAYOUT as L, SCENES, SFX, SceneId, sfxTime } from "./timeline";

const C = BRAND.charcoal;
const F = L.floor;
/** Scene start (s). Every cue below is relative to a scene start, so retiming SCENES moves it. */
const T = Object.fromEntries(Object.entries(SCENES).map(([k, v]) => [k, v[0]])) as Record<SceneId, number>;

type Geo = { x: number; y: number; w: number; h: number };
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpGeo = (a: Geo, b: Geo, p: number): Geo => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });
const phaseAt = (x: number, s: number) => (1000 - x) / (215 * s);

/** External outline around «الإرهاق الشديد — 18%» in screen px (poll image is 770 px wide in its card). */
const POLL_W = L.pollCard.w - 40;
const POLL_K = POLL_W / ASSETS.poll.w;
const POLL_H = ASSETS.poll.h * POLL_K;
const ROW = ASSETS.fatigueRow;
const OUTLINE: Geo = {
  x: L.pollCard.x - POLL_W / 2 + (ROW.x + ROW.w / 2) * POLL_K,
  y: L.pollCard.y - POLL_H / 2 + (ROW.y + ROW.h / 2) * POLL_K,
  w: ROW.w * POLL_K + 8,
  h: ROW.h * POLL_K + 8,
};
const SERIES = L.seriesCards;
const card2: Geo = { x: SERIES.xs[1], y: SERIES.y, w: SERIES.w, h: SERIES.h };

const FACTORS = [
  { x: 745, y: 760, label: "قلة النوم", glyph: <MoonGlyph r={30} /> },
  { x: 245, y: 760, label: "الألم", glyph: <PainGlyph /> },
  { x: 745, y: 1262, label: "بعض الأدوية", glyph: <PillGlyph /> },
  { x: 245, y: 1262, label: "الحرارة", glyph: <HeatGlyph /> },
];
const factorPath = (f: { x: number; y: number }) => {
  // Leaves the badge from its inner side so the label under it stays clear.
  const side = f.x > L.cx ? 1 : -1;
  const sx = f.x - side * 72;
  return `M ${sx} ${f.y} C ${sx - side * 60} ${f.y} ${L.cx + side * 200} 1010 ${L.cx + side * 140} 1010`;
};
const CHECKS = [
  { x: 745, label: "أنيميا", glyph: <DropGlyph /> },
  { x: 495, label: "الغدة", glyph: <ThyroidGlyph /> },
  { x: 245, label: "نقص عناصر", glyph: <VitaminGlyph /> },
];
const NODE_NUMS = ["١", "٢", "٣", "٤"];
const SLEEP_BED = 545;
const FAN = { x: 190, y: 880 };
const HOUSE = { l: 160, r: 830, top: 800, apex: 600, floor: 1330 };

/** Original product / screenshot inside an off-white card. Only the container moves, scales and fades. */
const ImageCard: React.FC<{ g: Geo; src: string; iw: number; ih: number; label?: string; opacity: number; scale?: number }> = ({ g, src, iw, ih, label, opacity, scale = 1 }) => {
  if (opacity <= 0) return null;
  const boxW = g.w - 50;
  const boxH = g.h - (label ? 110 : 40);
  const k = Math.min(boxW / iw, boxH / ih);
  return (
    <div
      style={{
        position: "absolute",
        left: g.x - g.w / 2,
        top: g.y - g.h / 2,
        width: g.w,
        height: g.h,
        borderRadius: 32,
        backgroundColor: BRAND.offWhite,
        boxShadow: `0 22px 48px ${BRAND.orangeShadow}88`,
        overflow: "hidden",
        opacity,
        scale: String(scale),
      }}
    >
      <Img
        src={staticFile(src)}
        style={{ position: "absolute", left: (g.w - iw * k) / 2, top: 20 + (boxH - ih * k) / 2, width: iw * k, height: ih * k, borderRadius: 12 }}
      />
      {label ? (
        <div dir="ltr" style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: 34, color: C, whiteSpace: "nowrap" }}>
          {label}
        </div>
      ) : null}
    </div>
  );
};

export const MSFatigue: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const k = (keys: ReadonlyArray<readonly [number, number]>, easing: (x: number) => number = EASE.inOut) => track(frame, fps, keys, easing);
  const sp = (at: number, damping = 200) => spring({ frame: frame - at * fps, fps, config: { damping, stiffness: 120 } });
  const win = (a: number, b: number, fi = 0.3, fo = 0.3) => interpolate(t, [a, a + fi, b, b + fo], [0, 1, 1, 0], CLAMP);
  const f = (s: number) => Math.round(s * fps);

  // ---------- Camera: gentle push-ins and drift across one board ----------
  const cam = morphStates(t, [
    { move: [0, 0], state: { s: 1, y: 0 } },
    { move: [T.topic, T.topic + 1.2], state: { s: 1.04, y: -20 } },
    { move: [T.morning, T.morning + 0.8], state: { s: 1, y: 0 } },
    { move: [T.factors, T.factors + 1], state: { s: 1.02, y: -10 } },
    { move: [T.help, T.help + 0.8], state: { s: 1, y: 0 } },
    { move: [T.sleep, T.sleep + 1.5], state: { s: 1.03, y: -14 } },
    { move: [T.doctor, T.doctor + 0.8], state: { s: 1, y: 0 } },
    { move: [T.family, T.family + 2], state: { s: 1.02, y: -12 } },
    { move: [T.comments, T.comments + 0.8], state: { s: 1, y: 0 } },
  ]);
  const drift = 6 * Math.sin(t * 0.35);

  // ---------- Series cards (opening + ending) ----------
  const openCards = 1 - k([[T.poll + 1.15, 0], [T.poll + 1.55, 1]]);
  const card2Active = k([[T.poll + 0.7, 0], [T.poll + 0.95, 1]]);
  const toPoll = k([[T.poll + 1.15, 0], [T.poll + 1.85, 1]]);
  const morphCard = lerpGeo(card2, L.pollCard, toPoll);
  const endCards = t >= T.next - 0.1;
  const endActive = k([[T.next + 0.2, 1], [T.next + 0.9, 0.55]]);
  const endGlow = k([[T.next + 0.6, 0], [T.next + 1.2, 1]]) * (0.88 + 0.12 * Math.sin((t - T.next) * 2.4));
  const seriesLine = endCards ? k([[T.next - 0.1, 0], [T.next + 0.4, 1]], EASE.out) : k([[T.poll + 0.1, 0], [T.poll + 0.6, 1]], EASE.out);

  // ---------- Poll card (asset B) ----------
  const pollIn = k([[T.poll + 1.7, 0], [T.poll + 2.05, 1]]);
  const pollOut = k([[T.topic, 0], [T.topic + 0.6, 1]]);
  const outlineDraw = k([[T.poll + 2.6, 0], [T.poll + 3.1, 1]], EASE.out);

  // ---------- Battery (persistent) ----------
  const bat = morphStates(t, [
    { move: [0, 0], state: { ...OUTLINE, nub: 0 } },
    { move: [T.topic, T.topic + 0.7], state: { ...L.battery, nub: 1 } },
    { move: [T.morning, T.morning + 0.6], state: { x: 230, y: 640, w: 180, h: 90, nub: 1 } },
    { move: [T.research - 0.1, T.research + 0.5], state: { x: 495, y: 1420, w: 200, h: 100, nub: 1 } },
    { move: [T.factors, T.factors + 0.6], state: { x: 495, y: 1010, w: 260, h: 130, nub: 1 } },
    { move: [T.help, T.help + 0.6], state: { x: 495, y: 1190, w: 220, h: 110, nub: 1 } },
    { move: [T.move, T.move + 0.6], state: { x: 225, y: 1010, w: 190, h: 95, nub: 1 } },
    { move: [T.resistance, T.resistance + 0.5], state: { x: 790, y: 880, w: 170, h: 85, nub: 1 } },
    { move: [T.pacing, T.pacing + 0.6], state: { x: 495, y: 1270, w: 220, h: 110, nub: 1 } },
    { move: [T.sleep, T.sleep + 0.6], state: { x: 770, y: 880, w: 170, h: 85, nub: 1 } },
    { move: [T.doctor, T.doctor + 0.6], state: { x: 495, y: 1440, w: 170, h: 85, nub: 1 } },
    { move: [T.next - 0.3, T.next + 0.3], state: { x: card2.x, y: card2.y + 5, w: 130, h: 64, nub: 1 } },
  ]);
  const M = T.move;
  const P = T.pacing;
  const level = k([
    [T.topic + 0.8, 0], [T.topic + 1.4, 0.18],
    [T.factors + 1.1, 0.18], [T.factors + 1.35, 0.16], [T.factors + 2.2, 0.16], [T.factors + 2.45, 0.14],
    [T.factors + 3.3, 0.14], [T.factors + 3.55, 0.12], [T.factors + 4.4, 0.12], [T.factors + 4.65, 0.11],
    [M + 1.4, 0.11], [M + 1.8, 0.16], [M + 2.4, 0.16], [M + 2.8, 0.21], [M + 3.4, 0.21], [M + 3.8, 0.26],
    [M + 4.3, 0.26], [M + 4.7, 0.31], [M + 5.1, 0.31], [M + 5.5, 0.36], [T.resistance + 3.5, 0.4],
    [P + 2.3, 0.4], [P + 2.9, 0.34], [P + 3.4, 0.4], [P + 4.0, 0.34], [P + 4.5, 0.4], [P + 5, 0.35],
    [T.sleep + 0.5, 0.38], [T.sleep + 4, 0.45],
  ]);
  const batteryOn = t >= T.topic;

  // ---------- Morning ----------
  const bedOn = win(T.morning + 0.2, T.research, 0.01, 0.35);
  const bedDraw = k([[T.morning + 0.2, 0], [T.morning + 0.9, 1]], EASE.out);
  const rise = k([[T.morning + 1.6, 0], [T.morning + 2.4, 0.8]]);
  const lift = k([[T.morning + 2.4, 0], [T.morning + 3.1, 0.75], [T.morning + 3.8, 0.75], [T.morning + 4.3, 0.3]]);
  const blanketMorph = k([[T.research, 0], [T.research + 0.6, 1]]);
  const morningLink = win(T.morning + 0.5, T.research - 0.2, 0.01, 0.3) * k([[T.morning + 0.5, 0], [T.morning + 1.1, 1]], EASE.out);

  // ---------- Research (asset A) ----------
  const researchIn = k([[T.research + 0.45, 0], [T.research + 0.75, 1]]);
  const researchAside = k([[T.factors, 0], [T.factors + 0.6, 1]]);

  // ---------- Factors ----------
  const factorAt = (i: number) => T.factors + 0.6 + i * 1.1;
  const factorsOut = 1 - k([[T.help - 0.05, 0], [T.help + 0.35, 1]]);

  // ---------- Routine board / strip ----------
  const boardP = sp(T.help + 0.2);
  const toStrip = k([[T.help + 2.5, 0], [T.help + 3.2, 1]]);
  const board = lerpGeo(L.board, L.strip, toStrip);
  const boardOn = interpolate(boardP, [0, 0.4], [0, 1], CLAMP) * (1 - k([[T.creatine, 0], [T.creatine + 0.35, 1]]));
  const nodeXs = (i: number) => lerp(765 - i * 180, 705 - i * 140, toStrip);
  const nodeR = lerp(52, 34, toStrip);
  const activeIdx = t < T.pacing ? 0 : t < T.sleep ? 1 : t < T.doctor ? 2 : 3;
  const nodeActive = (i: number) =>
    i === activeIdx ? k([[Math.max(T.help + 1.0, [T.help, T.pacing, T.sleep, T.doctor][i]), 0], [Math.max(T.help + 1.3, [T.help, T.pacing, T.sleep, T.doctor][i] + 0.3), 1]]) : 0;

  // ---------- Figure (move → resistance) ----------
  const floorOn = win(T.move, T.pacing, 0.3, 0.4);
  const trackOn = win(T.move, T.resistance, 0.3, 0.4);
  const figX = k([[M + 0.3, 800], [M + 1.5, 650], [M + 2.4, 650], [M + 3.7, 500]]);
  const figStride = k([[M + 0.3, 0], [M + 0.45, 0.8], [M + 1.3, 0.8], [M + 1.5, 0], [M + 2.4, 0], [M + 2.55, 0.8], [M + 3.5, 0.8], [M + 3.7, 0]]);
  const R = T.resistance;
  const sit = k([[R + 0.4, 0], [R + 1.1, 1]]);
  const rowX = k([[R + 1.3, 455], [R + 2.0, 545], [R + 2.35, 545], [R + 3.0, 455], [R + 3.25, 455], [R + 3.85, 530]]);
  const pose = {
    x: figX,
    floor: F,
    stride: figStride,
    phase: phaseAt(figX, 1),
    sit,
    hands: { x: rowX, y: F - 205 },
    handsAmt: k([[R + 0.9, 0], [R + 1.25, 1]]),
    opacity: win(M + 0.1, T.pacing - 0.1, 0.3, 0.3),
  };
  const fig = solveFigure(pose);
  const bandMorph = k([[R + 0.1, 0], [R + 0.8, 1]]);
  const toSchedule = k([[P, 0], [P + 0.6, 1]]);
  const anchorPt = { x: 242, y: F - 200 };
  const wrist = fig.arms[1].wrist;
  const band = {
    x1: lerp(lerp(120, anchorPt.x, bandMorph), 120, toSchedule),
    y1: lerp(lerp(F, anchorPt.y, bandMorph), 1000, toSchedule),
    x2: lerp(lerp(880, wrist.x, bandMorph), 880, toSchedule),
    y2: lerp(lerp(F, wrist.y, bandMorph), 1000, toSchedule),
  };
  const days = k([[M + 1.4, 0], [M + 1.8, 1], [M + 2.4, 1], [M + 2.8, 2], [M + 3.4, 2], [M + 3.8, 3], [M + 4.3, 3], [M + 4.7, 4], [M + 5.1, 4], [M + 5.5, 5]]);
  const gymOn = win(R, P, 0.3, 0.35);

  // ---------- Pacing ----------
  const pacingOn = win(P + 0.3, T.sleep - 0.1, 0.3, 0.35);
  const bigCard = sp(P + 0.4);
  const split = k([[P + 1.3, 0], [P + 1.9, 1]]);
  const restXs = [620, 370];
  const cursor = morphStates(t, [
    { move: [0, 0], state: { x: 745, w: 204, h: 174, r: 30 } },
    { move: [P + 2.8, P + 3.0], state: { x: restXs[0], w: 88, h: 88, r: 44 } },
    { move: [P + 3.3, P + 3.5], state: { x: 495, w: 204, h: 174, r: 30 } },
    { move: [P + 3.9, P + 4.1], state: { x: restXs[1], w: 88, h: 88, r: 44 } },
    { move: [P + 4.4, P + 4.6], state: { x: 245, w: 204, h: 174, r: 30 } },
  ]);
  const cursorOn = win(P + 2.2, T.sleep - 0.2, 0.2, 0.3);

  // ---------- Sleep ----------
  const S = T.sleep;
  const moonMove = k([[S, 0], [S + 0.7, 1]]);
  const sleepOn = win(S + 0.2, T.doctor, 0.01, 0.35);
  const sleepBedDraw = k([[S + 0.2, 0], [S + 0.9, 1]], EASE.out);
  const fanP = k([[S + 1.4, 0], [S + 2.0, 1]], EASE.out);
  const toDoctor = k([[T.doctor, 0], [T.doctor + 0.6, 1]]);
  const fanRing = lerpGeo({ x: FAN.x, y: FAN.y, w: 170, h: 170 }, L.doctorCard, toDoctor);

  // ---------- Doctor ----------
  const D = T.doctor;
  const doctorOut = k([[T.creatine, 0], [T.creatine + 0.3, 1]]);
  const toProduct = k([[T.creatine, 0], [T.creatine + 0.6, 1]]);
  const doctorCard = lerpGeo(fanRing, L.productSolo, toProduct);

  // ---------- Products (assets C, D) ----------
  const Q = T.carnitine;
  const creatineIn = k([[T.creatine + 0.45, 0], [T.creatine + 0.75, 1]]);
  const aside = k([[Q, 0], [Q + 0.6, 1]]);
  const together = k([[Q + 1.8, 0], [Q + 2.3, 1]]);
  const productsOut = k([[T.family - 0.2, 0], [T.family + 0.4, 1]]);
  const creatineG = lerpGeo(L.productSolo, L.productLeft, aside);
  const carnitineG = lerpGeo(lerpGeo({ ...L.productSolo, x: 1250 }, { x: 650, y: 905, w: 460, h: 600 }, aside), L.productRight, together);
  const exitY = 70 * productsOut;
  const productLink = k([[Q + 2.4, 0], [Q + 2.9, 1]], EASE.out) * (1 - k([[T.family + 0.2, 0], [T.family + 0.6, 1]]));

  // ---------- Family ----------
  const H = T.family;
  const houseDraw = k([[H + 0.2, 0], [H + 1.0, 1]], EASE.out);
  const homeOn = win(H + 0.2, T.comments - 0.2, 0.01, 0.35);
  const bubbleP = sp(H + 1.6);
  const toComment = k([[T.comments - 0.1, 0], [T.comments + 0.4, 1]]);
  const commentG = lerpGeo({ x: 385, y: 790, w: 210, h: 110 }, L.commentCard, toComment);
  const toCard2 = k([[T.next - 0.3, 0], [T.next + 0.3, 1]]);
  const commentFinal = lerpGeo(commentG, card2, toCard2);
  const repliesOn = 1 - k([[T.next - 0.4, 0], [T.next - 0.1, 1]]);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.orange, fontFamily: ARABIC_FONT }}>
      <BrandBackground
        frame={frame}
        fps={fps}
        width={width}
        height={height}
        focus={[
          [0, 860], [T.topic, 980], [T.morning, 1000], [T.research, 925], [T.factors, 1010], [T.help, 860],
          [T.move, 1050], [T.pacing, 1050], [T.sleep, 1050], [T.doctor, 900], [T.creatine, 900],
          [T.family, 1000], [T.comments, 900], [T.next, 820], [SCENES.next[1], 820],
        ]}
        morphTimes={Object.values(T).map((s) => s + 0.5)}
      />

      {/* ================= World (moves with the camera) ================= */}
      <AbsoluteFill style={{ transformOrigin: "540px 960px", scale: String(cam.s), translate: `0 ${cam.y + drift}px` }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute" }}>
          <defs>
            <filter id="mf-shadow" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx={0} dy={22} stdDeviation={24} floodColor={BRAND.orangeShadow} floodOpacity={0.5} />
            </filter>
            <filter id="mw-shadow" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx={0} dy={18} stdDeviation={18} floodColor={BRAND.orangeShadow} floodOpacity={0.45} />
            </filter>
          </defs>

          {/* Series cards */}
          {(openCards > 0 || endCards) && seriesLine > 0 ? (
            <line x1={120} y1={SERIES.y} x2={lerp(120, 880, seriesLine)} y2={SERIES.y} stroke={C} strokeWidth={7} strokeLinecap="round" opacity={endCards ? 1 : openCards} />
          ) : null}
          {openCards > 0 || endCards
            ? SERIES.xs.map((x, i) => {
                if (i === 1 && !endCards) return null;
                if (i === 1 && t < T.next + 0.3) return null;
                return (
                  <TopicCard
                    key={i}
                    x={x}
                    y={SERIES.y}
                    w={SERIES.w}
                    h={SERIES.h}
                    p={endCards ? (i === 1 ? 1 : sp(T.next - 0.05 + i * 0.08)) : sp(T.poll + 0.1 + i * 0.1)}
                    active={i === 1 ? endActive : 0}
                    glow={endCards && i === 2 ? endGlow : 0}
                    glyph={i === 0 || (i === 1 && endCards)}
                    opacity={endCards ? 1 : openCards}
                  />
                );
              })
            : null}
          {openCards > 0 || endCards ? (
            <Figure x={SERIES.xs[0] + 5} floor={SERIES.y + 72} scale={0.36} opacity={endCards ? sp(T.next) : openCards * sp(T.poll + 0.3)} />
          ) : null}
          {/* Card 2 grows into the poll card */}
          {t < T.poll + 2.1 ? (
            <g>
              <path d={rrPath(morphCard.x, morphCard.y, morphCard.w, morphCard.h, 30)} fill={BRAND.offWhite} filter="url(#mw-shadow)" opacity={interpolate(sp(T.poll + 0.3), [0, 0.4], [0, 1], CLAMP)} />
              <path d={rrPath(morphCard.x, morphCard.y, morphCard.w, morphCard.h, 30)} fill="none" stroke={BRAND.orangeBright} strokeWidth={8} opacity={card2Active * (1 - toPoll)} />
              <g opacity={1 - toPoll}>
                <rect x={card2.x - 94} y={card2.y - 26} width={110} height={12} rx={6} fill={BRAND.gray} opacity={sp(T.poll + 0.3)} />
                <rect x={card2.x - 94} y={card2.y + 4} width={150} height={12} rx={6} fill={BRAND.gray} opacity={sp(T.poll + 0.3)} />
              </g>
            </g>
          ) : null}

          {/* Morning: bed, sunrise, battery link */}
          {bedOn > 0 ? (
            <g opacity={bedOn}>
              <Bed cx={L.bed.cx} floor={L.bed.floor} draw={bedDraw} rise={rise} lift={lift} blanket={t < T.research} />
              <SunWindow x={770} y={700} p={k([[T.morning + 0.9, 0], [T.morning + 1.4, 1]])} rise={k([[T.morning + 1.0, 0], [T.morning + 3.8, 1]])} />
            </g>
          ) : null}
          <Drawn d="M 230 690 C 230 860 300 900 300 1050" p={morningLink} w={5} dash="2 14" />
          {t >= T.research && t < T.research + 0.85 ? (
            (() => {
              const g = lerpGeo({ x: L.bed.cx + 50, y: L.bed.floor - 140, w: 400, h: 76 }, L.researchCard, blanketMorph);
              return <path d={rrPath(g.x, g.y, g.w, g.h, lerp(26, 32, blanketMorph))} fill={BRAND.offWhite} stroke={C} strokeWidth={6 * (1 - blanketMorph)} filter="url(#mw-shadow)" />;
            })()
          ) : null}

          {/* Factors → battery */}
          {factorsOut > 0
            ? FACTORS.map((fct, i) => {
                const a = factorAt(i);
                const d = factorPath(fct);
                const pulseT = interpolate(t, [a + 0.6, a + 1.0], [0, 1], CLAMP);
                const pt = pulseT > 0 && pulseT < 1 ? getPointAtLength(d, pulseT * getLength(d)) : null;
                return (
                  <g key={i} opacity={factorsOut}>
                    <Drawn d={d} p={k([[a + 0.2, 0], [a + 0.6, 1]], EASE.out)} w={5} />
                    {pt ? (
                      <g>
                        <circle cx={pt.x} cy={pt.y} r={22} fill={BRAND.offWhite} opacity={0.35} />
                        <circle cx={pt.x} cy={pt.y} r={11} fill={BRAND.offWhite} stroke={C} strokeWidth={4} />
                      </g>
                    ) : null}
                    <Pop x={fct.x} y={fct.y} p={sp(a, 14)}>
                      <Badge r={70}>{fct.glyph}</Badge>
                    </Pop>
                  </g>
                );
              })
            : null}

          {/* Routine board → progress strip */}
          {boardOn > 0 ? (
            <g opacity={boardOn}>
              <CardShape x={board.x} y={board.y} w={board.w * interpolate(boardP, [0, 1], [0.7, 1])} h={board.h} r={lerp(40, 52, toStrip)} />
              <line x1={nodeXs(3)} y1={board.y} x2={nodeXs(0)} y2={board.y} stroke={C} strokeWidth={5} strokeDasharray="3 12" strokeLinecap="round" />
              {NODE_NUMS.map((n, i) => (
                <Node key={n} x={nodeXs(i)} y={board.y} r={nodeR} n={n} active={nodeActive(i)} p={sp(T.help + 0.45 + i * 0.12)} />
              ))}
            </g>
          ) : null}

          {/* Floor, walking track, calendar, chair, anchor, band */}
          {floorOn > 0 ? <line x1={120} y1={F} x2={880} y2={F} stroke={C} strokeWidth={8} strokeLinecap="round" opacity={floorOn} /> : null}
          {trackOn > 0
            ? Array.from({ length: 12 }, (_, i) => (
                <rect key={i} x={150 + i * 62} y={F + 16} width={30} height={8} rx={4} fill={BRAND.offWhite} opacity={trackOn * 0.9} />
              ))
            : null}
          <Calendar x={225} y={760} days={days} opacity={win(M + 0.4, R, 0.3, 0.3)} />
          {gymOn > 0 ? (
            <g opacity={gymOn}>
              <Chair cx={600} floor={F} draw={k([[R, 0], [R + 0.5, 1]], EASE.out)} />
              <Anchor x={230} floor={F} ringY={anchorPt.y} p={k([[R + 0.1, 0], [R + 0.6, 1]], EASE.out)} />
              <Steps x={780} y={720} p={k([[R + 1.4, 0], [R + 3.6, 1]])} />
            </g>
          ) : null}
          <Figure {...pose} />
          {t >= R && t < P + 1 ? (
            <g opacity={1 - toSchedule * 0.5}>
              <line x1={band.x1} y1={band.y1} x2={band.x2} y2={band.y2} stroke={C} strokeWidth={lerp(8, 16, bandMorph * (1 - toSchedule))} strokeLinecap="round" />
              <line x1={band.x1} y1={band.y1} x2={band.x2} y2={band.y2} stroke={BRAND.beige} strokeWidth={lerp(0, 8, bandMorph * (1 - toSchedule))} strokeLinecap="round" />
            </g>
          ) : null}

          {/* Pacing: one big task → three smaller tasks with rest markers */}
          {pacingOn > 0 ? (
            <g opacity={pacingOn}>
              <line x1={120} y1={1000} x2={880} y2={1000} stroke={C} strokeWidth={6} strokeLinecap="round" />
              {[745, 495, 245].map((x, i) => (
                <CardShape key={i} x={lerp(495, x, split)} y={1000} w={lerp(620, 180, split) * interpolate(bigCard, [0, 1], [0.8, 1])} h={lerp(170, 150, split)} lines={split > 0.5 ? 2 : 3} opacity={interpolate(bigCard, [0, 0.4], [0, 1], CLAMP) * (i === 1 ? 1 : interpolate(split, [0, 0.15], [0, 1], CLAMP))} />
              ))}
              {restXs.map((x, i) =>
                i === 1 && t >= S ? null : (
                  <Pop key={x} x={x} y={1000} p={sp(P + 1.9 + i * 0.12, 14)}>
                    <circle r={32} fill={BRAND.beige} stroke={C} strokeWidth={5} />
                    <rect x={-10} y={-12} width={7} height={24} rx={3} fill={C} />
                    <rect x={3} y={-12} width={7} height={24} rx={3} fill={C} />
                  </Pop>
                ),
              )}
              {cursorOn > 0 ? (
                <path d={rrPath(cursor.x, 1000, cursor.w, cursor.h, cursor.r)} fill="none" stroke={BRAND.offWhite} strokeWidth={7} opacity={cursorOn} />
              ) : null}
            </g>
          ) : null}
          {/* Rest marker → moon */}
          {t >= S && t < T.doctor + 0.4 ? (
            <g opacity={1 - k([[T.doctor, 0], [T.doctor + 0.35, 1]])} transform={`translate(${lerp(restXs[1], 770, moonMove)} ${lerp(1000, 690, moonMove)})`}>
              <circle r={lerp(32, 0, moonMove)} fill={BRAND.beige} stroke={C} strokeWidth={5} opacity={1 - moonMove} />
              <g opacity={moonMove} transform={`scale(${lerp(0.6, 1.2, moonMove)})`}>
                <MoonGlyph r={36} />
              </g>
            </g>
          ) : null}

          {/* Sleep: bed + fan + airflow */}
          {sleepOn > 0 ? (
            <g opacity={sleepOn}>
              <Bed cx={SLEEP_BED} floor={L.bed.floor} draw={sleepBedDraw} rise={0} lift={0} breathe={3 * Math.sin(t * 1.6)} />
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M ${FAN.x + 92} ${FAN.y - 30 + i * 32} C ${FAN.x + 170} ${FAN.y + i * 40} ${FAN.x + 150} ${1040 + i * 14} ${FAN.x + 200 + i * 50} ${1080 + i * 8}`}
                  fill="none"
                  stroke={BRAND.offWhite}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray="14 18"
                  strokeDashoffset={-t * 50}
                  opacity={k([[S + 2.0, 0], [S + 2.5, 0.9]]) * (1 - toDoctor)}
                />
              ))}
            </g>
          ) : null}
          {t >= S && t < T.doctor + 0.2 ? (
            <Fan x={FAN.x} y={FAN.y} r={85} floor={L.bed.floor} angle={(t - S) * 160} p={fanP} opacity={1 - toDoctor} />
          ) : null}

          {/* Fan ring → doctor card → creatine card */}
          {t >= T.doctor && t < T.creatine + 0.85 ? (
            <path d={rrPath(doctorCard.x, doctorCard.y, doctorCard.w, doctorCard.h, lerp(85, 32, toDoctor))} fill={BRAND.offWhite} stroke={C} strokeWidth={7 * (1 - toDoctor)} filter="url(#mf-shadow)" />
          ) : null}
          {t >= D && t < T.creatine + 0.4 ? (
            <g opacity={1 - doctorOut}>
              <DoctorIcon x={L.doctorCard.x} y={L.doctorCard.y - 22} p={sp(D + 0.5)} />
              <g opacity={sp(D + 0.7)}>
                <rect x={L.doctorCard.x - 80} y={L.doctorCard.y + 82} width={160} height={13} rx={6.5} fill={BRAND.gray} />
                <rect x={L.doctorCard.x - 52} y={L.doctorCard.y + 106} width={104} height={13} rx={6.5} fill={BRAND.gray} />
              </g>
              {CHECKS.map((c, i) => (
                <g key={c.x}>
                  <Drawn d={`M ${L.doctorCard.x} ${L.doctorCard.y + 150} C ${L.doctorCard.x} 1070 ${c.x} 1030 ${c.x} 1108`} p={k([[D + 1.1, 0], [D + 1.6, 1]], EASE.out)} w={5} dash="2 14" />
                  <Pop x={c.x} y={1180} p={sp(D + 1.5 + i * 0.35, 14)}>
                    <Badge r={70}>{c.glyph}</Badge>
                  </Pop>
                </g>
              ))}
            </g>
          ) : null}

          {/* Shared connector between the two product cards → home outline */}
          <g transform={`translate(0 ${exitY})`}>
            <Drawn d="M 285 612 C 285 540 705 540 705 612" p={productLink} w={6} />
          </g>
          {homeOn > 0 ? (
            <g opacity={homeOn}>
              <Drawn d={`M 495 ${HOUSE.apex} L ${HOUSE.l} ${HOUSE.top} L ${HOUSE.l} ${HOUSE.floor} L 495 ${HOUSE.floor}`} p={houseDraw} w={7} />
              <Drawn d={`M 495 ${HOUSE.apex} L ${HOUSE.r} ${HOUSE.top} L ${HOUSE.r} ${HOUSE.floor} L 495 ${HOUSE.floor}`} p={houseDraw} w={7} />
              <Sofa cx={520} floor={HOUSE.floor} p={k([[H + 0.6, 0], [H + 1.0, 1]])} />
              <Figure x={420} floor={HOUSE.floor} sit={1} opacity={k([[H + 0.7, 0], [H + 1.1, 1]])} />
              <Figure
                x={650}
                floor={HOUSE.floor}
                lean={k([[H + 2.2, 0], [H + 3.0, 0.12]])}
                hands={{ x: 548, y: HOUSE.floor - 212 }}
                handsAmt={k([[H + 3.4, 0], [H + 3.9, 1]])}
                oneHand
                opacity={k([[H + 0.9, 0], [H + 1.3, 1]])}
              />
              <Figure x={255} floor={HOUSE.floor} flip lean={k([[H + 2.0, 0], [H + 2.8, 0.14]])} opacity={k([[H + 1.0, 0], [H + 1.4, 1]])} />
              {t < T.comments - 0.05 ? <Bubble x={385} y={790} w={210} h={110} p={bubbleP} tail="left" kind="lines" /> : null}
            </g>
          ) : null}

          {/* Comment card → series card 2 */}
          {t >= T.comments - 0.1 && t < T.next + 0.35 ? (
            <g>
              <CardShape x={commentFinal.x} y={commentFinal.y} w={commentFinal.w} h={commentFinal.h} r={lerp(36, 28, toCard2)} lines={toCard2 > 0.3 ? 0 : 3} />
              <g opacity={repliesOn}>
                <Bubble x={580} y={1110} w={360} h={110} p={sp(T.comments + 0.5)} tail="right" kind="lines" />
                <Bubble x={430} y={1250} w={360} h={110} p={sp(T.comments + 0.85)} tail="left" kind="lines" />
              </g>
            </g>
          ) : null}
        </svg>

        {/* ---------- Original images in off-white cards ---------- */}
        <ImageCard g={{ ...L.pollCard, y: L.pollCard.y + 40 * pollOut }} src={ASSETS.poll.src} iw={ASSETS.poll.w} ih={ASSETS.poll.h} opacity={pollIn * (1 - pollOut)} scale={lerp(0.97, 1, pollIn) * lerp(1, 0.9, pollOut)} />
        <ImageCard
          g={{ ...L.researchCard, x: L.researchCard.x - 700 * researchAside * researchAside }}
          src={ASSETS.research.src}
          iw={ASSETS.research.w}
          ih={ASSETS.research.h}
          opacity={researchIn * (1 - researchAside)}
          scale={lerp(1, 0.8, researchAside)}
        />
        <ImageCard g={{ ...creatineG, y: creatineG.y + exitY }} src={ASSETS.creatine.src} iw={ASSETS.creatine.w} ih={ASSETS.creatine.h} label="Creatine Monohydrate" opacity={creatineIn * lerp(1, 0.55, aside * (1 - together)) * (1 - productsOut)} />
        <ImageCard g={{ ...carnitineG, y: carnitineG.y + exitY }} src={ASSETS.carnitine.src} iw={ASSETS.carnitine.w} ih={ASSETS.carnitine.h} label="L-Carnitine" opacity={aside * (1 - productsOut)} />

        {/* ---------- Overlay: poll outline → battery ---------- */}
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute" }}>
          {!batteryOn && outlineDraw > 0 ? (
            (() => {
              const d = rrPath(OUTLINE.x, OUTLINE.y, OUTLINE.w, OUTLINE.h, 16);
              const e = evolvePath(outlineDraw, d);
              return <path d={d} fill="none" stroke={BRAND.orangeBright} strokeWidth={5} strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
            })()
          ) : null}
          {batteryOn ? (
            <Battery
              x={bat.x}
              y={bat.y}
              w={bat.w}
              h={bat.h}
              level={level}
              nub={bat.nub}
              stroke={t < T.topic + 0.3 ? BRAND.orangeBright : C}
            />
          ) : null}
        </svg>

        {/* ---------- Labels ---------- */}
        {FACTORS.map((fct, i) => (
          <ArLabel key={fct.label} x={fct.x} y={fct.y + 80} text={fct.label} progress={sp(factorAt(i) + 0.1)} opacity={factorsOut} size={44} weight={700} />
        ))}
        {CHECKS.map((c, i) => (
          <ArLabel key={c.label} x={c.x} y={1262} text={c.label} progress={sp(D + 1.6 + i * 0.35)} opacity={(1 - doctorOut) * (t < T.creatine + 0.4 ? 1 : 0)} size={44} weight={700} />
        ))}
        <ArLabel x={L.cx} y={1172 + exitY} text="مكملات — ناقشها مع طبيبك" progress={sp(Q + 2.2)} opacity={1 - productsOut} size={50} weight={700} />
        <ArLabel x={L.cx} y={1246 + exitY} text="فائدتها لإرهاق الـMS غير مؤكدة" progress={sp(Q + 2.45)} opacity={1 - productsOut} size={44} weight={600} />
      </AbsoluteFill>

      {/* ---------- Headings (screen-fixed) ---------- */}
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
          lines={[{ text: h.title, size: h.size ?? 84, weight: 700 }, ...(h.small ? [{ text: h.small, size: h.smallSize ?? 46, weight: h.smallSize ? (700 as const) : (600 as const) }] : [])]}
        />
      ))}

      <FilmGrain frame={frame} width={width} height={height} animated={false} />

      {/* ---------- Optional subtle SFX (separate stem; the main render is muted) ---------- */}
      {SFX.map((c, i) => (
        <Audio key={i} name={`${c.sound} – ${c.label}`} src={staticFile(`audio/${c.sound}.mp3`)} from={f(sfxTime(c))} premountFor={fps} volume={c.volume} />
      ))}
    </AbsoluteFill>
  );
};
