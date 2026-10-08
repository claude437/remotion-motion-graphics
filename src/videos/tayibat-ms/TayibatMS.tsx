import { Audio } from "@remotion/media";
import { translatePath } from "@remotion/paths";
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  interpolateColors,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type SpringConfig,
} from "remotion";
import { CLAMP, EASE, track } from "../../lib/animation";
import { morphStates } from "../../lib/morph";
// Shared brand system + reused components from the Vitamin D series.
import { BrandBackground } from "../vitamin-d-ms/components/BrandBackground";
import { FilmGrain } from "../vitamin-d-ms/components/FilmGrain";
import { KineticText } from "../vitamin-d-ms/components/KineticText";
import { MRIScan } from "../vitamin-d-ms/components/MRIScan";
import {
  NerveMyelin,
  sleeveGeometry,
} from "../vitamin-d-ms/components/NerveMyelin";
import { SceneTransition } from "../vitamin-d-ms/components/SceneTransition";
import { TreatmentIcon } from "../vitamin-d-ms/components/TreatmentIcon";
import { ArLabel } from "../vitamin-d-ms-part2/components/ArLabel";
import { DoctorIcon } from "../vitamin-d-ms-part2/components/DoctorMonitoringPanel";
// New for this video.
import {
  FOOD_GROUPS,
  FoodPlate,
  sectorAngles,
  type SectorState,
} from "./components/FoodPlate";
import {
  BlisterPack,
  PrescriptionCard,
  StopBracket,
  Tablet,
  blisterCell,
} from "./components/MedicationCard";
import {
  Battery,
  BowelIcon,
  Checklist,
  HeatIcon,
  NutrientTile,
  tilePath,
} from "./components/NutrientTiles";
import {
  DietCard,
  Magnifier,
  QuestionMark,
  ResearchCards,
  paperPath,
} from "./components/ResearchCards";
import {
  Cigarette,
  ProhibitionStroke,
  Shisha,
  SmokeRibbon,
  smokePath,
} from "./components/SmokeIcons";
import { Spoon, SugarCube, SweetDrink } from "./components/SugarDrink";
import { WaterGlass } from "./components/WaterGlass";
import { circlePath, glassPath, morph, rrPath, sectorPath } from "./shapes";
import { BRAND, CAIRO } from "./theme";
import { FINAL_SUBTITLE, LAYOUT, SCENES, SFX, scene } from "./timeline";

type Nerve = { x: number; y: number; width: number; opacity: number };

const SFX_FILES = {
  whoosh: "audio/whoosh.mp3",
  click: "audio/click.mp3",
  pulse: "audio/pulse.mp3",
  liquid: "audio/liquid.mp3",
} as const;

// Brain contour (same drawing as the shared MRIScan) for the MRI → plate morph.
const BRAIN =
  "M 0 -230 C 110 -232 190 -160 196 -40 C 202 80 160 200 60 228 C 30 236 -30 236 -60 228 C -160 200 -202 80 -196 -40 C -190 -160 -110 -232 0 -230 Z";

/** Sugar pile slots (bottom row first). Only the first three stay: moderation. */
const PILE = [
  [345, 1010],
  [415, 1010],
  [485, 1010],
  [555, 1010],
  [380, 952],
  [450, 952],
  [520, 952],
  [415, 894],
  [485, 894],
] as const;
const PILE_KEEP = 3;

const HALO_COUNT = 34;
const HALO = Array.from({ length: HALO_COUNT }, (_, i) => ({
  a: (i / HALO_COUNT) * Math.PI * 2 + random(`ha-${i}`) * 0.3,
  rj: 0.84 + random(`hr-${i}`) * 0.26,
  size: 6 + random(`hs-${i}`) * 6,
  dir: random(`hd-${i}`) > 0.5 ? 1 : -1,
}));

/**
 * TayibatMS — 30 s, 1080×1920, 60 fps. Why the Tayibat diet should not replace
 * evidence-based MS care. One continuous sequence: every scene's objects morph
 * into the next scene's objects in its final 0.4 s, and a recurring myelinated
 * nerve ties it together. Timing/layout/SFX: ./timeline.ts.
 */
export const TayibatMS: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const sec = frame / fps;
  const f = (s: number) => Math.round(s * fps);
  const p = (a: number, b: number, easing = EASE.inOut) =>
    interpolate(sec, [a, b], [0, 1], { ...CLAMP, easing });
  const sp = (at: number, config: Partial<SpringConfig> = { damping: 200 }) =>
    spring({ frame: frame - at * fps, fps, config });
  const pop = (at: number) => sp(at, { damping: 14, stiffness: 150 });
  const win = (a: number, b: number, fi = 0.25, fo = 0.25) =>
    interpolate(sec, [a, a + fi, b, b + fo], [0, 1, 1, 0], CLAMP);
  const S = scene;

  // ---------------- Recurring nerve ----------------
  const lane: Nerve = { ...LAYOUT.nerveLane, opacity: 1 };
  const hero: Nerve = { ...LAYOUT.nerveHero, opacity: 1 };
  const nerve = morphStates<Nerve>(sec, [
    { move: [0, 0], state: lane },
    { move: [S(2).out, S(2).end], state: hero },
    { move: [S(3).out, S(3).end], state: lane },
    { move: [S(6).out, S(6).end], state: hero },
    { move: [S(7).out, S(7).end], state: lane },
    { move: [S(8).out, S(8).end], state: hero },
    { move: [S(9).out, S(9).end], state: lane },
    { move: [S(11).out, S(11).end], state: hero },
    { move: [S(12).out, S(12).end], state: lane },
    {
      move: [S(14).out, S(14).end],
      state: { ...LAYOUT.nerveFinal, opacity: 1 },
    },
  ]);
  const phase = sec * 0.8;
  const damage = p(S(3).start + 0.15, S(3).start + 0.7);
  // Signal pulses: regular in general, irregular (stutter + uneven spacing) in scene 12.
  const irregular = sec >= S(12).start && sec < S(12).end;
  const pulses = irregular
    ? [
        ((sec - 22) * 1.15 + 0.1 * Math.sin(sec * 9)) % 1,
        ((sec - 22) * 0.55 + 0.45) % 1,
        Math.max(0, ((sec - 22.6) * 1.6) % 1.3),
      ]
    : [(sec * 0.7) % 1.25, (sec * 0.7 + 0.62) % 1.25];
  const sleeves = sleeveGeometry(LAYOUT.nerveHero.width, 1, phase);
  const damagedSleeve = (n: Nerve) => {
    const g = sleeveGeometry(n.width, 1, phase)[LAYOUT.damagedSleeve];
    return { x: n.x + g.cx, y: n.y + g.cy };
  };

  // ---------------- Plate states ----------------
  const allIn: SectorState[] = FOOD_GROUPS.map(() => ({ out: 0, opacity: 1 }));
  const removed = [1, 3, 4];
  const restrictSectors: SectorState[] = FOOD_GROUPS.map((_, i) => ({
    out: removed.includes(i)
      ? p(
          S(4).start + 0.5 + removed.indexOf(i) * 0.1,
          S(4).start + 1.1 + removed.indexOf(i) * 0.1,
        )
      : 0,
    opacity: 1,
  }));
  const balancedSectors: SectorState[] = FOOD_GROUPS.map((_, i) => ({
    out: 1 - sp(S(14).start + 0.05 + i * 0.09, { damping: 16, stiffness: 120 }),
    opacity: 1,
  }));

  // ---------------- Tiles (scene 5) ----------------
  const T = LAYOUT.tiles;
  const tileMap = [0, 1, 3, 2, 4]; // sector i → tile index
  const tileSize = LAYOUT.tileSize;

  // ---------------- Sugar (scene 6) ----------------
  const cubeLand = (k: number) => S(6).start + 0.12 + k * 0.09;
  const reduceStart = S(6).start + 1.05;

  // ---------------- Halo particles (scenes 6→8) ----------------
  const soften = p(S(7).start + 0.45, S(7).start + 1.4);
  const haloPos = (i: number, n: Nerve) => {
    const h = HALO[i];
    const a = h.a + sec * 0.22 * h.dir;
    const grow = 1 + 0.12 * soften;
    return {
      x: n.x + Math.cos(a) * LAYOUT.halo.rx * h.rj * grow,
      y:
        n.y +
        Math.sin(a) * LAYOUT.halo.ry * h.rj * grow +
        Math.sin(sec * 3 + i) * 6,
    };
  };
  const cigTip = { x: LAYOUT.cigarette.x + 124, y: LAYOUT.cigarette.y - 26 };
  const shishaBowl = { x: LAYOUT.shisha.x, y: LAYOUT.shisha.y - 130 };

  // ---------------- Medication (scene 11) ----------------
  const looseIndex = 5;
  const looseCell = blisterCell(
    LAYOUT.blister.x,
    LAYOUT.blister.y,
    LAYOUT.blister.w,
    LAYOUT.blister.h,
    looseIndex,
  );
  const slide = p(S(11).start + 0.55, S(11).start + 0.95, EASE.in);
  const stopped = sp(S(11).start + 0.95, { damping: 10, stiffness: 160 });
  const tabletY =
    sec < S(11).start + 0.95
      ? looseCell.y + 250 * slide
      : looseCell.y + 250 - 26 * stopped;
  const toNerve = p(S(11).out, S(11).end + 0.1);
  const nerveTarget = damagedSleeve(nerve);

  // ---------------- Morph helpers ----------------
  const tr = (n: number) => p(S(n).out, S(n).end); // transition progress of scene n
  const plateHook = LAYOUT.plateHook;
  const plateMain = LAYOUT.plateMain;
  const plateBal = LAYOUT.plateBalanced;
  const papers = LAYOUT.papers;

  // Scene 14 → 15: the plate turns gently and settles into the final layout.
  const finalPlate = morphStates<{
    x: number;
    y: number;
    r: number;
    rot: number;
  }>(sec, [
    { move: [0, 0], state: { ...plateBal, rot: 0 } },
    {
      move: [S(14).out, S(15).start + 0.4],
      state: { ...LAYOUT.plateFinal, rot: 24 },
    },
  ]);
  const settle = p(S(15).end - 0.5, S(15).end, EASE.out);
  const settleRot = finalPlate.rot + 6 * (1 - settle) - 6;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.orange, fontFamily: CAIRO }}>
      <BrandBackground
        frame={frame}
        fps={fps}
        width={width}
        height={height}
        focus={[
          [0, 900],
          [6, 860],
          [12, 950],
          [18, 860],
          [24, 900],
          [30, 900],
        ]}
        morphTimes={SCENES.map((_, i) => S(i + 1).end - 0.2)}
      />

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute" }}
      >
        <defs>
          <filter id="tay-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow
              dx={0}
              dy={18}
              stdDeviation={18}
              floodColor={BRAND.orangeShadow}
              floodOpacity={0.5}
            />
          </filter>
        </defs>

        {SCENES.slice(0, -1).map((_, i) => (
          <SceneTransition
            key={i}
            frame={frame}
            fps={fps}
            at={S(i + 1).out}
            x={LAYOUT.cx}
            y={850}
          />
        ))}

        {/* ===== 01 Hook: plate + "الطيبات" card + nerve + question ===== */}
        <FoodPlate
          x={plateHook.x + 520 * (1 - sp(0.05, { damping: 18, stiffness: 90 }))}
          y={plateHook.y}
          r={plateHook.r}
          sectors={allIn}
          sec={sec}
          rotation={-40 * (1 - sp(0.05, { damping: 18, stiffness: 90 }))}
          opacity={sec < S(1).out ? 1 : 0}
        />
        <DietCard {...LAYOUT.dietCard} p={pop(0.5)} opacity={1 - tr(1)} />
        {sec < S(1).end ? (
          <path
            d={`M ${LAYOUT.dietCard.x} ${LAYOUT.dietCard.y + 80} C ${LAYOUT.dietCard.x} ${LAYOUT.question.y - 90}, ${LAYOUT.question.x} ${LAYOUT.question.y - 90}, ${LAYOUT.question.x} ${LAYOUT.question.y - 80}`}
            stroke={BRAND.charcoal}
            strokeWidth={5}
            strokeDasharray="4 14"
            strokeLinecap="round"
            fill="none"
            opacity={0.6 * p(0.9, 1.2) * (1 - tr(1))}
          />
        ) : null}
        <QuestionMark
          x={LAYOUT.question.x}
          y={LAYOUT.question.y}
          draw={p(1.0, 1.45)}
          scale={1.05}
          opacity={1 - tr(1)}
        />
        {/* T1: plate sectors → research-paper shapes */}
        {sec >= S(1).out && sec < S(2).start + 0.05
          ? FOOD_GROUPS.map((g, i) => {
              const [a0, a1] = sectorAngles(i);
              const q = tr(1);
              return (
                <path
                  key={g.id}
                  d={morph(
                    q,
                    sectorPath(
                      plateHook.x,
                      plateHook.y,
                      plateHook.r,
                      a0 + 1.5,
                      a1 - 1.5,
                    ),
                    paperPath(papers.x, papers.y, papers.w, papers.h),
                  )}
                  fill={interpolateColors(q, [0, 1], [g.fill, BRAND.offWhite])}
                  stroke={BRAND.charcoal}
                  strokeWidth={5}
                />
              );
            })
          : null}

        {/* ===== 02 Evidence: papers unfold, magnifier finds an open question ===== */}
        <ResearchCards
          cx={papers.x}
          cy={papers.y}
          w={papers.w}
          h={papers.h}
          spread={papers.spread}
          unfold={sp(S(2).start + 0.05, { damping: 18, stiffness: 110 })}
          lines={p(S(2).start + 0.25, S(2).start + 0.9)}
          opacity={sec >= S(2).start ? 1 - p(S(2).out, S(2).out + 0.3) : 0}
        />
        <QuestionMark
          x={LAYOUT.cx}
          y={590}
          draw={p(S(2).start + 1.0, S(2).start + 1.3)}
          scale={0.95}
          opacity={1 - p(S(2).out, S(2).out + 0.2)}
        />
        {sec >= S(2).start + 0.35 && sec < S(2).end ? (
          <Magnifier
            x={track(frame, fps, [
              [S(2).start + 0.35, 250],
              [S(2).start + 0.8, 420],
              [S(2).start + 1.05, 650],
              [S(2).start + 1.3, LAYOUT.cx],
            ])}
            y={track(frame, fps, [
              [S(2).start + 0.35, 770],
              [S(2).start + 0.8, 730],
              [S(2).start + 1.05, 790],
              [S(2).start + 1.3, 596],
            ])}
            scale={1 + 0.45 * p(S(2).start + 1.05, S(2).start + 1.3)}
            opacity={win(S(2).start + 0.35, S(2).out, 0.2, 0.2)}
          />
        ) : null}
        {/* T2: a paper line stretches down into the rising nerve */}
        {sec >= S(2).out && sec < S(3).start + 0.15 ? (
          <line
            x1={LAYOUT.cx}
            y1={papers.y + 60}
            x2={LAYOUT.cx}
            y2={
              papers.y +
              60 +
              (nerve.y - papers.y - 60) * p(S(2).out, S(2).out + 0.25)
            }
            stroke={BRAND.charcoal}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={1 - p(S(2).end - 0.1, S(3).start + 0.15)}
          />
        ) : null}

        {/* ===== 03 Not an established treatment: diet symbol stops short ===== */}
        {sec >= S(3).start && sec < S(3).end
          ? (() => {
              const t = damagedSleeve(nerve);
              const a = sp(S(3).start + 0.3, { damping: 20, stiffness: 80 });
              const bx = interpolate(a, [0, 1], [880, t.x + 150]);
              const by = interpolate(a, [0, 1], [600, t.y - 150]);
              const ring = p(S(3).start + 0.9, S(3).start + 1.35, EASE.out);
              return (
                <g opacity={1 - tr(3)}>
                  <line
                    x1={bx}
                    y1={by}
                    x2={t.x + 40}
                    y2={t.y - 40}
                    stroke={BRAND.charcoal}
                    strokeWidth={4}
                    strokeDasharray="4 12"
                    strokeLinecap="round"
                    opacity={0.5 * a}
                  />
                  {ring > 0 && ring < 1 ? (
                    <circle
                      cx={bx}
                      cy={by}
                      r={60 + 70 * ring}
                      fill="none"
                      stroke={BRAND.offWhite}
                      strokeWidth={4}
                      opacity={0.6 * (1 - ring)}
                    />
                  ) : null}
                  <DietCard x={bx} y={by} w={150} h={96} p={a} />
                </g>
              );
            })()
          : null}
        {/* T3: cream myelin shapes → food-group sectors */}
        {sec >= S(3).out && sec < S(4).start + 0.05
          ? FOOD_GROUPS.map((g, i) => {
              const s = sleeves[i];
              const [a0, a1] = sectorAngles(i);
              const q = tr(3);
              const sx = LAYOUT.nerveHero.x + s.cx;
              const sy = LAYOUT.nerveHero.y + s.cy;
              return (
                <path
                  key={g.id}
                  d={morph(
                    q,
                    rrPath(sx, sy, s.w, s.h, s.h / 2),
                    sectorPath(
                      plateMain.x,
                      plateMain.y,
                      plateMain.r,
                      a0 + 1.5,
                      a1 - 1.5,
                    ),
                  )}
                  fill={interpolateColors(q, [0, 1], [BRAND.beige, g.fill])}
                  stroke={BRAND.charcoal}
                  strokeWidth={4.5}
                />
              );
            })
          : null}

        {/* ===== 04 Restricting food groups ===== */}
        {sec >= S(4).start && sec < S(4).out ? (
          <FoodPlate
            x={plateMain.x}
            y={plateMain.y}
            r={plateMain.r}
            sectors={restrictSectors}
            emptyOutlines={1}
            sec={sec}
            rimOpacity={p(S(3).end - 0.2, S(4).start + 0.15)}
            iconOpacity={p(S(4).start, S(4).start + 0.25)}
          />
        ) : null}
        {/* T4: empty spaces → (missing) tiles; remaining sectors → present tiles */}
        {sec >= S(4).out && sec < S(5).start + 0.05 ? (
          <g>
            <circle
              cx={plateMain.x}
              cy={plateMain.y}
              r={plateMain.r + 34}
              fill={BRAND.offWhite}
              stroke={BRAND.charcoal}
              strokeWidth={7}
              opacity={1 - tr(4)}
            />
            {FOOD_GROUPS.map((g, i) => {
              const [a0, a1] = sectorAngles(i);
              const tile = T[tileMap[i]];
              const q = tr(4);
              const empty = removed.includes(i);
              return (
                <path
                  key={g.id}
                  d={morph(
                    q,
                    sectorPath(
                      plateMain.x,
                      plateMain.y,
                      plateMain.r,
                      a0 + 1.5,
                      a1 - 1.5,
                    ),
                    tilePath(tile.x, tile.y, tileSize),
                  )}
                  fill={
                    empty
                      ? "none"
                      : interpolateColors(q, [0, 1], [g.fill, BRAND.offWhite])
                  }
                  stroke={BRAND.charcoal}
                  strokeWidth={empty ? 5 : 6}
                  strokeDasharray={empty ? "12 10" : undefined}
                  opacity={empty ? 0.7 : 1}
                />
              );
            })}
          </g>
        ) : null}

        {/* ===== 05 Potential nutrient deficiencies ===== */}
        {sec >= S(5).start && sec < S(5).end
          ? T.map((t) => (
              <NutrientTile
                key={t.label}
                x={t.x}
                y={t.y}
                size={tileSize}
                label={t.label}
                filled={t.filled}
                opacity={t.filled ? (sec < S(5).out ? 1 : 0) : 1 - tr(5)}
                labelOpacity={p(S(5).start, S(5).start + 0.3)}
              />
            ))
          : null}
        <Battery
          x={LAYOUT.battery.x}
          y={LAYOUT.battery.y}
          level={0.22}
          scale={pop(S(5).start + 0.4) * 0.95}
          opacity={
            (sec >= S(5).start ? 1 : 0) *
            (1 - tr(5)) *
            (0.75 + 0.25 * Math.sin(sec * 8))
          }
        />
        <BowelIcon
          x={LAYOUT.bowel.x}
          y={LAYOUT.bowel.y}
          unease={1}
          sec={sec}
          scale={0.8 * pop(S(5).start + 0.6)}
          opacity={(sec >= S(5).start ? 1 : 0) * (1 - tr(5))}
        />
        {/* T5: present tiles → sugar cubes */}
        {sec >= S(5).out && sec < S(6).start + 0.05
          ? T.filter((t) => t.filled).map((t, k) => {
              const q = tr(5);
              const [px, py] = PILE[k];
              return (
                <path
                  key={t.label}
                  d={morph(
                    q,
                    tilePath(t.x, t.y, tileSize),
                    rrPath(px, py - 10, 62, 62, 10),
                  )}
                  fill={BRAND.offWhite}
                  stroke={BRAND.charcoal}
                  strokeWidth={6}
                />
              );
            })
          : null}

        {/* ===== 06 Added sugar ===== */}
        {sec >= S(6).start && sec < S(6).end ? (
          <g opacity={1 - tr(6)}>
            <Spoon
              x={LAYOUT.sugar.spoon.x}
              y={LAYOUT.sugar.spoon.y + 40 * (1 - pop(S(6).start + 0.05))}
              opacity={pop(S(6).start + 0.05)}
            />
            <SweetDrink
              x={LAYOUT.sugar.drink.x}
              y={LAYOUT.sugar.drink.y}
              scale={0.95 * pop(S(6).start + 0.15)}
              sec={sec}
            />
          </g>
        ) : null}
        {sec >= S(6).start && sec < S(6).end
          ? PILE.map(([px, py], k) => {
              const land = k < 2 ? 0 : cubeLand(k);
              const fall = k < 2 ? 1 : p(land - 0.18, land, EASE.in);
              if (fall <= 0) return null;
              const leave =
                k < PILE_KEEP
                  ? 0
                  : p(
                      reduceStart + (k - PILE_KEEP) * 0.05,
                      reduceStart + 0.3 + (k - PILE_KEEP) * 0.05,
                      EASE.in,
                    );
              const toDots = tr(6);
              return (
                <SugarCube
                  key={k}
                  x={px + (k < PILE_KEEP ? 0 : 160 * leave)}
                  y={py - 260 * (1 - fall) - 300 * leave}
                  s={70 * (1 - leave * 0.6) * (1 - toDots * 0.85)}
                  opacity={(1 - leave) * (1 - toDots)}
                  rotation={k * 7 - 10}
                />
              );
            })
          : null}

        {/* ===== 07 Inflammatory factors: restrained particle halo ===== */}
        {sec >= S(6).out && sec < S(8).start + 0.05
          ? HALO.map((h, i) => {
              const home = haloPos(i, nerve);
              // T6: particles emerge from the remaining cubes' dots.
              const [cx0, cy0] = PILE[i % PILE_KEEP];
              const gather = tr(6);
              let x =
                sec < S(7).start
                  ? cx0 +
                    (home.x - cx0) * gather +
                    (random(`hx-${i}`) - 0.5) * 50 * (1 - gather)
                  : home.x;
              let y =
                sec < S(7).start
                  ? cy0 +
                    (home.y - cy0) * gather +
                    (random(`hy-${i}`) - 0.5) * 40 * (1 - gather)
                  : home.y;
              // T7: particles stream into the smoke origins.
              const q = tr(7);
              if (q > 0) {
                const tgt = i % 2 === 0 ? cigTip : shishaBowl;
                const mx = (home.x + tgt.x) / 2 + (i % 2 === 0 ? -80 : 80);
                const my = Math.min(home.y, tgt.y) - 80;
                x =
                  (1 - q) * (1 - q) * home.x +
                  2 * (1 - q) * q * mx +
                  q * q * tgt.x;
                y =
                  (1 - q) * (1 - q) * home.y +
                  2 * (1 - q) * q * my +
                  q * q * tgt.y;
              }
              const o =
                (sec < S(7).start ? gather : 1) * (1 - 0.42 * soften) * (1 - q);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={h.size * (1 - 0.25 * soften)}
                  fill={BRAND.charcoal}
                  opacity={0.85 * o}
                />
              );
            })
          : null}
        {sec >= S(6).out && sec < S(7).end ? (
          <SugarCube
            x={interpolate(tr(6), [0, 1], [PILE[0][0], 812])}
            y={interpolate(tr(6), [0, 1], [PILE[0][1], 640])}
            s={70 * (1 - 0.45 * p(S(7).start + 0.4, S(7).start + 1.0))}
            opacity={1 - tr(7)}
          />
        ) : null}
        {/* T7: particle trails → smoke curls */}
        {sec >= S(7).out && sec < S(8).end ? (
          <g opacity={1 - tr(8)}>
            <SmokeRibbon
              d={smokePath(260, 980, cigTip.x, cigTip.y, sec * 1.5, 30)}
              draw={tr(7)}
              opacity={0.9}
            />
            <SmokeRibbon
              d={smokePath(
                760,
                980,
                shishaBowl.x,
                shishaBowl.y,
                sec * 1.5 + 1,
                30,
              )}
              draw={tr(7)}
              opacity={0.9}
            />
          </g>
        ) : null}

        {/* ===== 08 Smoking ===== */}
        {sec >= S(8).start && sec < S(9).start + 0.1 ? (
          <g>
            <g opacity={1 - tr(8)}>
              <SmokeRibbon
                d={smokePath(
                  cigTip.x,
                  cigTip.y,
                  cigTip.x - 60,
                  cigTip.y - 230,
                  sec * 2,
                  22,
                )}
                draw={p(S(8).start + 0.3, S(8).start + 0.9)}
                opacity={0.85}
                width={16}
              />
              <SmokeRibbon
                d={smokePath(
                  shishaBowl.x,
                  shishaBowl.y,
                  shishaBowl.x + 40,
                  shishaBowl.y - 210,
                  sec * 2 + 2,
                  22,
                )}
                draw={p(S(8).start + 0.4, S(8).start + 1.0)}
                opacity={0.85}
                width={16}
              />
              <Cigarette
                x={LAYOUT.cigarette.x}
                y={LAYOUT.cigarette.y}
                draw={p(S(8).start, S(8).start + 0.6)}
              />
              <Shisha
                x={LAYOUT.shisha.x}
                y={LAYOUT.shisha.y}
                draw={p(S(8).start + 0.1, S(8).start + 0.75)}
              />
              <ProhibitionStroke
                x1={190}
                y1={600}
                x2={830}
                y2={930}
                draw={p(S(8).start + 0.6, S(8).start + 0.9, EASE.out)}
              />
            </g>
            {/* Smoke drifts toward the nerve, then carries on into scene 9 (off to the left). */}
            <g
              transform={`translate(${-260 * tr(8)} 0)`}
              opacity={1 - p(S(8).end - 0.1, S(9).start + 0.1)}
            >
              <SmokeRibbon
                d={smokePath(
                  cigTip.x - 30,
                  cigTip.y + 40,
                  300,
                  nerve.y - 50,
                  sec * 1.6,
                  34,
                )}
                draw={p(S(8).start + 0.9, S(8).start + 1.6)}
                opacity={0.75}
                width={22}
              />
              <SmokeRibbon
                d={smokePath(
                  shishaBowl.x - 20,
                  LAYOUT.shisha.y + 160,
                  620,
                  nerve.y - 50,
                  sec * 1.6 + 1.5,
                  34,
                )}
                draw={p(S(8).start + 1.0, S(8).start + 1.7)}
                opacity={0.75}
                width={22}
              />
            </g>
          </g>
        ) : null}

        {/* ===== 09 Secondhand smoke meets a protective boundary ===== */}
        {sec >= S(9).start - 0.2 && sec < S(9).end
          ? [0, 1, 2].map((k) => {
              const y0 = 820 + k * 85;
              const d = `M -200 ${y0} C 0 ${y0 + 10}, 70 ${y0 + 6}, 80 ${y0 - 70} S ${-10 - k * 20} ${y0 - 260}, ${-140} ${y0 - 330}`;
              return (
                <SmokeRibbon
                  key={k}
                  d={d}
                  draw={p(
                    S(9).start - 0.2 + k * 0.12,
                    S(9).start + 1.0 + k * 0.12,
                  )}
                  opacity={0.8 * (1 - tr(9))}
                  width={24}
                />
              );
            })
          : null}
        {sec >= S(9).start && sec < S(10).start + 0.05
          ? (() => {
              const b = LAYOUT.shield;
              const box = rrPath(
                (b.x1 + b.x2) / 2,
                (b.y1 + b.y2) / 2,
                b.x2 - b.x1,
                b.y2 - b.y1,
                130,
              );
              const q = tr(9);
              const drawIn = p(S(9).start + 0.25, S(9).start + 0.7);
              const hit = p(S(9).start + 0.75, S(9).start + 1.2, EASE.out);
              return (
                <g>
                  {hit > 0 && hit < 1 ? (
                    <circle
                      cx={b.x1}
                      cy={900}
                      r={30 + 90 * hit}
                      fill="none"
                      stroke={BRAND.offWhite}
                      strokeWidth={5}
                      opacity={0.7 * (1 - hit)}
                    />
                  ) : null}
                  <path
                    d={
                      q > 0
                        ? morph(
                            q,
                            box,
                            glassPath(
                              LAYOUT.glass.x,
                              LAYOUT.glass.y,
                              LAYOUT.glass.w,
                              LAYOUT.glass.h,
                            ),
                          )
                        : box
                    }
                    fill="none"
                    stroke={interpolateColors(
                      q,
                      [0, 1],
                      [BRAND.offWhite, BRAND.charcoal],
                    )}
                    strokeWidth={8}
                    strokeDasharray={
                      q > 0.5
                        ? undefined
                        : `${18 * drawIn + 0.01} ${14 + 2000 * (1 - drawIn)}`
                    }
                    strokeLinecap="round"
                    opacity={drawIn}
                  />
                </g>
              );
            })()
          : null}

        {/* ===== 10 Hydration ===== */}
        {sec >= S(10).start && sec < S(10).end ? (
          <WaterGlass
            id="tay-glass"
            x={LAYOUT.glass.x}
            y={LAYOUT.glass.y}
            w={LAYOUT.glass.w}
            h={LAYOUT.glass.h}
            fill={p(S(10).start + 0.1, S(10).start + 1.0)}
            highlights={
              sec < S(10).out ? p(S(10).start + 0.5, S(10).start + 0.8) : 0
            }
            opacity={1 - tr(10)}
            sec={sec}
          />
        ) : null}
        <HeatIcon
          x={LAYOUT.heat.x}
          y={LAYOUT.heat.y}
          p={sec >= S(10).start ? pop(S(10).start + 0.85) * (1 - tr(10)) : 0}
          sec={sec}
        />
        <BowelIcon
          x={LAYOUT.bowel.x + 50}
          y={1080}
          unease={0.25}
          sec={sec}
          scale={0.8 * pop(S(10).start + 1.1)}
          opacity={(sec >= S(10).start ? 1 : 0) * (1 - tr(10))}
        />
        {/* T10: glass highlights → blister compartments */}
        {sec >= S(10).out && sec < S(11).start + 0.1
          ? [0, 2].map((cellIdx, k) => {
              const g = LAYOUT.glass;
              const from =
                k === 0
                  ? rrPath(g.x - g.w / 2 + 43, g.y, 10, g.h - 120, 5)
                  : rrPath(g.x - g.w / 2 + 69, g.y - g.h / 2 + 105, 7, 90, 3.5);
              const c = blisterCell(
                LAYOUT.blister.x,
                LAYOUT.blister.y,
                LAYOUT.blister.w,
                LAYOUT.blister.h,
                cellIdx,
              );
              return (
                <path
                  key={k}
                  d={morph(tr(10), from, rrPath(c.x, c.y, 92, 60, 30))}
                  fill={BRAND.offWhite}
                  stroke={BRAND.charcoal}
                  strokeWidth={4 * tr(10)}
                  opacity={1 - p(S(11).start, S(11).start + 0.1)}
                />
              );
            })
          : null}

        {/* ===== 11 Do not stop medication on your own ===== */}
        {sec >= S(10).out + 0.2 && sec < S(11).end ? (
          <g opacity={1 - p(S(11).out, S(11).out + 0.3)}>
            <PrescriptionCard {...LAYOUT.rx} p={pop(S(11).start + 0.05)} />
            <BlisterPack
              {...LAYOUT.blister}
              p={sec < S(11).start ? p(S(10).out + 0.2, S(11).start) : 1}
              loose={{ index: looseIndex, dx: 0, dy: 0, opacity: 1 }}
            />
            <StopBracketH
              x={looseCell.x}
              y={looseCell.y + 300}
              w={130}
              draw={p(S(11).start + 0.85, S(11).start + 1.05, EASE.out)}
            />
          </g>
        ) : null}
        {sec >= S(10).out + 0.2 && sec < S(12).start + 0.15 ? (
          <Tablet
            x={looseCell.x + (nerveTarget.x - looseCell.x) * toNerve}
            y={tabletY + (nerveTarget.y - 60 - tabletY) * toNerve}
            scale={1 - 0.4 * toNerve}
            opacity={1 - p(S(11).end - 0.1, S(12).start + 0.15)}
          />
        ) : null}

        {/* ===== Recurring nerve ===== */}
        <NerveMyelin
          x={nerve.x}
          y={nerve.y}
          width={nerve.width}
          draw={p(0.2, 1.1)}
          myelin={p(0.35, 1.2)}
          wave={1}
          phase={phase}
          opacity={nerve.opacity}
          damage={{ index: LAYOUT.damagedSleeve, amount: damage }}
          pulses={sec > 1.1 ? pulses : []}
        />

        {/* ===== 12 Possible return of activity: inflammatory marker ===== */}
        {sec >= S(12).start - 0.1 && sec < S(13).start + 0.05
          ? (() => {
              const t = damagedSleeve(nerve);
              const mx = t.x;
              const my = t.y - 78;
              const inP = pop(S(12).start + 0.3);
              const q = tr(12);
              const m = LAYOUT.mri;
              const pulse = 1 + 0.08 * Math.sin(sec * 7);
              if (q > 0) {
                return (
                  <path
                    d={morph(
                      q,
                      circlePath(mx, my, 26),
                      rrPath(m.x, m.y, m.w, m.h, 40),
                    )}
                    fill="none"
                    stroke={BRAND.charcoal}
                    strokeWidth={8}
                  />
                );
              }
              return (
                <g transform={`translate(${mx} ${my}) scale(${inP * pulse})`}>
                  {Array.from({ length: 8 }, (_, k) => {
                    const a = (k / 8) * Math.PI * 2;
                    return (
                      <line
                        key={k}
                        x1={Math.cos(a) * 26}
                        y1={Math.sin(a) * 26}
                        x2={Math.cos(a) * 40}
                        y2={Math.sin(a) * 40}
                        stroke={BRAND.charcoal}
                        strokeWidth={6}
                        strokeLinecap="round"
                      />
                    );
                  })}
                  <circle r={26} fill={BRAND.charcoal} />
                  <circle r={11} fill={BRAND.orangeBright} />
                </g>
              );
            })()
          : null}

        {/* ===== 13 Feeling better is not enough: symptoms + MRI → follow-up ===== */}
        {sec >= S(12).end - 0.1 && sec < S(13).end ? (
          <g opacity={1 - tr(13)}>
            <path
              d={rrPath(
                LAYOUT.mri.x,
                LAYOUT.mri.y,
                LAYOUT.mri.w,
                LAYOUT.mri.h,
                40,
              )}
              fill={BRAND.charcoal}
              opacity={p(S(13).start - 0.02, S(13).start + 0.12)}
              filter="url(#tay-shadow)"
            />
            <MRIScan
              x={LAYOUT.mri.x}
              y={LAYOUT.mri.y}
              w={LAYOUT.mri.w}
              h={LAYOUT.mri.h}
              draw={p(S(13).start + 0.1, S(13).start + 0.7)}
              scan={p(S(13).start + 0.4, S(13).start + 1.2)}
              improve={0}
              opacity={1}
            />
            <Battery
              x={LAYOUT.energy.x}
              y={LAYOUT.energy.y}
              level={interpolate(
                p(S(13).start + 0.4, S(13).start + 1.2),
                [0, 1],
                [0.25, 0.95],
              )}
              scale={0.82 * pop(S(13).start + 0.2)}
            />
            {[LAYOUT.energy.x, LAYOUT.mri.x].map((sx, k) => (
              <path
                key={k}
                d={`M ${sx} ${k === 0 ? LAYOUT.energy.y + 110 : LAYOUT.mri.y + LAYOUT.mri.h / 2 + 10} C ${sx} ${LAYOUT.followUp.y - 40}, ${LAYOUT.followUp.x} ${LAYOUT.followUp.y - 120}, ${LAYOUT.followUp.x + (k === 0 ? -30 : 30)} ${LAYOUT.followUp.y - 60}`}
                fill="none"
                stroke={BRAND.charcoal}
                strokeWidth={5}
                strokeDasharray="4 14"
                strokeLinecap="round"
                opacity={0.6 * p(S(13).start + 0.9, S(13).start + 1.2)}
              />
            ))}
            <g
              transform={`translate(${LAYOUT.followUp.x} ${LAYOUT.followUp.y}) scale(0.72) translate(${-LAYOUT.followUp.x} ${-LAYOUT.followUp.y})`}
            >
              <DoctorIcon
                x={LAYOUT.followUp.x}
                y={LAYOUT.followUp.y}
                p={pop(S(13).start + 1.05)}
              />
            </g>
          </g>
        ) : null}
        {/* T13: MRI contours → plate divisions */}
        {sec >= S(13).out && sec < S(14).start + 0.15 ? (
          <g opacity={1 - p(S(14).start, S(14).start + 0.15)}>
            <path
              d={morph(
                tr(13),
                translatePath(BRAIN, LAYOUT.mri.x, LAYOUT.mri.y - 10),
                circlePath(plateBal.x, plateBal.y, plateBal.r + 34),
              )}
              fill="none"
              stroke={BRAND.charcoal}
              strokeWidth={7}
            />
            {FOOD_GROUPS.map((_, i) => {
              const a = ((i * 72 - 90) * Math.PI) / 180;
              const from = `M ${LAYOUT.mri.x} ${LAYOUT.mri.y - 240} L ${LAYOUT.mri.x} ${LAYOUT.mri.y + 220}`;
              const to = `M ${plateBal.x + Math.cos(a) * plateBal.r * 0.16} ${plateBal.y + Math.sin(a) * plateBal.r * 0.16} L ${plateBal.x + Math.cos(a) * plateBal.r} ${plateBal.y + Math.sin(a) * plateBal.r}`;
              return (
                <path
                  key={i}
                  d={morph(tr(13), from, to)}
                  stroke={BRAND.charcoal}
                  strokeWidth={5}
                  fill="none"
                  opacity={i === 0 ? 1 : tr(13)}
                />
              );
            })}
          </g>
        ) : null}

        {/* ===== 14 Personalized balanced eating → 15 final ===== */}
        {sec >= S(14).start ? (
          <g
            transform={`translate(0 ${sec >= S(15).start ? 8 * (1 - settle) : 0})`}
          >
            <FoodPlate
              x={finalPlate.x}
              y={finalPlate.y}
              r={finalPlate.r}
              rotation={sec >= S(15).start ? settleRot : finalPlate.rot}
              sectors={balancedSectors}
              sec={sec}
              rimOpacity={p(S(14).start, S(14).start + 0.15)}
            />
          </g>
        ) : null}
        {sec >= S(14).start && sec < S(14).end ? (
          <g opacity={1 - tr(14)}>
            <Checklist
              {...LAYOUT.checklist}
              p={pop(S(14).start + 0.2)}
              ticks={p(S(14).start + 0.4, S(14).start + 1.3)}
            />
            <BowelIcon
              x={LAYOUT.calmBowel.x}
              y={LAYOUT.calmBowel.y}
              unease={0}
              sec={sec * 0.5}
              scale={0.68 * pop(S(14).start + 0.5)}
            />
          </g>
        ) : null}
        {sec >= S(15).start - 0.1 ? (
          <g transform={`translate(0 ${8 * (1 - settle)})`}>
            <WaterGlass
              id="tay-final-glass"
              x={LAYOUT.finalGlass.x}
              y={LAYOUT.finalGlass.y}
              w={170}
              h={270}
              fill={p(S(15).start + 0.2, S(15).start + 0.9)}
              highlights={pop(S(15).start + 0.3)}
              opacity={pop(S(15).start)}
              sec={sec}
            />
            <TreatmentIcon
              x={LAYOUT.finalShield.x}
              y={LAYOUT.finalShield.y}
              scale={LAYOUT.finalShield.scale * pop(S(15).start + 0.3)}
              opacity={1}
            />
          </g>
        ) : null}
      </svg>

      {/* ---------- Arabic labels inside the diagrams ---------- */}
      <ArLabel
        x={LAYOUT.dietCard.x - 26}
        y={LAYOUT.dietCard.y - 30}
        text="الطيبات"
        size={46}
        weight={700}
        fontFamily={CAIRO}
        progress={pop(0.6)}
        opacity={1 - tr(1)}
      />
      <ArLabel
        x={LAYOUT.battery.x}
        y={LAYOUT.battery.y + 70}
        text="تعب"
        size={40}
        weight={700}
        fontFamily={CAIRO}
        progress={sp(S(5).start + 0.55)}
        opacity={sec >= S(5).start ? 1 - tr(5) : 0}
      />
      <ArLabel
        x={LAYOUT.bowel.x}
        y={LAYOUT.bowel.y + 92}
        text="إمساك"
        size={40}
        weight={700}
        fontFamily={CAIRO}
        progress={sp(S(5).start + 0.75)}
        opacity={sec >= S(5).start ? 1 - tr(5) : 0}
      />
      <ArLabel
        x={LAYOUT.energy.x}
        y={LAYOUT.energy.y + 52}
        text="الأعراض"
        size={38}
        weight={700}
        fontFamily={CAIRO}
        progress={sp(S(13).start + 0.5)}
        opacity={sec >= S(13).start ? 1 - tr(13) : 0}
      />
      <ArLabel
        x={LAYOUT.mri.x}
        y={LAYOUT.mri.y + LAYOUT.mri.h / 2 + 12}
        text="الرنين"
        size={38}
        weight={700}
        fontFamily={CAIRO}
        progress={sp(S(13).start + 0.6)}
        opacity={sec >= S(13).start ? 1 - tr(13) : 0}
      />
      <ArLabel
        x={LAYOUT.followUp.x}
        y={LAYOUT.followUp.y + 60}
        text="تقييم مع طبيبك"
        size={38}
        weight={700}
        fontFamily={CAIRO}
        progress={sp(S(13).start + 1.15)}
        opacity={sec >= S(13).start ? 1 - tr(13) : 0}
      />
      <ArLabel
        x={LAYOUT.checklist.x}
        y={LAYOUT.checklist.y - LAYOUT.checklist.h / 2 + 22}
        text="أخصائي تغذية"
        size={34}
        weight={700}
        fontFamily={CAIRO}
        progress={sp(S(14).start + 0.3)}
        opacity={sec >= S(14).start ? 1 - tr(14) : 0}
      />

      {/* ---------- Headlines, one Sequence per scene ---------- */}
      {SCENES.map((s, i) => {
        const n = i + 1;
        const last = n === SCENES.length;
        return (
          <Sequence
            key={s.id}
            name={`${String(n).padStart(2, "0")} · ${s.id}`}
            from={f(S(n).start)}
            durationInFrames={f(S(n).end - S(n).start)}
            layout="none"
          >
            <KineticText
              frame={frame}
              fps={fps}
              top={LAYOUT.textTop}
              left={96}
              right={180}
              fontFamily={CAIRO}
              inAt={S(n).start + (n === 1 ? 0.2 : 0.08)}
              outAt={last ? undefined : S(n).out - 0.05}
              stagger={0.06}
              lines={
                last
                  ? [
                      { text: s.text, size: 96 },
                      { text: FINAL_SUBTITLE, size: 44, weight: 600 },
                    ]
                  : [
                      {
                        text: s.text,
                        size:
                          s.text.length > 18
                            ? 70
                            : s.text.length > 14
                              ? 80
                              : 90,
                      },
                    ]
              }
            />
          </Sequence>
        );
      })}

      <FilmGrain frame={frame} width={width} height={height} />

      {/* ---------- SFX (no speech, no music). Cue list: timeline.ts → SFX ---------- */}
      {SFX.map((c, i) => (
        <Audio
          key={i}
          name={`SFX ${c.sound}: ${c.label}`}
          src={staticFile(SFX_FILES[c.sound])}
          from={f(c.at)}
          premountFor={fps}
          volume={c.volume}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Horizontal stop bracket (⊓) that catches the tablet sliding down. */
const StopBracketH: React.FC<{
  x: number;
  y: number;
  w: number;
  draw: number;
}> = ({ x, y, w, draw }) => (
  <g transform={`rotate(-90 ${x} ${y})`}>
    <StopBracket x={x} y={y} h={w} draw={draw} />
  </g>
);
