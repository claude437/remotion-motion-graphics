import {
  Easing,
  interpolate,
  random,
  spring,
  type SpringConfig,
} from "remotion";
import { CLAMP, EASE, track } from "../../lib/animation";
import { OUTCOME_LEVEL } from "./components/ComparisonBars";
import {
  DOT_FRACTIONS,
  pointOnMS,
  pointOnVitaminD,
} from "./components/AssociationGraph";
import type { CellState } from "./components/ImmuneCells";
import { CUE, LAYOUT } from "./timeline";

/**
 * Persistent objects (sun, nerve, cells, morphing panel) live for the whole
 * video. Each one is described as a list of states; a state change happens
 * over a move window, and the object eases from its previous state into the
 * next one. States may be functions of time (e.g. "follow the line tip").
 */
type Numeric = Record<string, number>;
type Phase<S extends Numeric> = {
  /** Move window in seconds. The first phase uses [0, 0]. */
  readonly move: readonly [number, number];
  readonly state: S | ((sec: number) => S);
  readonly easing?: (t: number) => number;
};

const resolve = <S extends Numeric>(s: Phase<S>["state"], sec: number): S =>
  typeof s === "function" ? s(sec) : s;

export const morphStates = <S extends Numeric>(
  sec: number,
  phases: readonly Phase<S>[],
): S => {
  let i = 0;
  while (i + 1 < phases.length && sec >= phases[i + 1].move[0]) i++;
  const cur = resolve(phases[i].state, sec);
  if (i === 0) return cur;
  const [a, b] = phases[i].move;
  const p =
    b <= a
      ? 1
      : interpolate(sec, [a, b], [0, 1], {
          ...CLAMP,
          easing: phases[i].easing ?? EASE.inOut,
        });
  if (p >= 1) return cur;
  const prev = resolve(phases[i - 1].state, sec);
  const out = { ...cur };
  for (const key of Object.keys(cur) as (keyof S)[]) {
    (out[key] as number) =
      (prev[key] as number) +
      ((cur[key] as number) - (prev[key] as number)) * p;
  }
  return out;
};

/** Overshooting ease for "pop" entrances inside morphStates. */
const BACK_OUT = Easing.bezier(0.34, 1.4, 0.64, 1);

const { bars } = LAYOUT;

type Placement = { x: number; y: number; size: number };
type NerveShape = {
  x: number;
  y: number;
  width: number;
  myelin: number;
  wave: number;
  opacity: number;
};
type PanelShape = {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  dark: number;
  opacity: number;
};

export const useChoreography = (frame: number, fps: number) => {
  const sec = frame / fps;
  const sp = (at: number, config: Partial<SpringConfig> = { damping: 200 }) =>
    spring({ frame: frame - at * fps, fps, config });

  // --- Comparison bars (needed by the suns that ride on top of them) ---
  const grow5000 =
    sp(CUE.barsGrow, { damping: 18, stiffness: 90 }) *
    track(frame, fps, [
      [CUE.finale, 1],
      [CUE.finale + 0.45, 0],
    ]);
  const grow600 =
    sp(CUE.barsGrow + 0.08, { damping: 18, stiffness: 90 }) *
    track(frame, fps, [
      [CUE.finale, 1],
      [CUE.finale + 0.45, 0],
    ]);
  const top5000 = bars.base - bars.maxHeight * OUTCOME_LEVEL.d5000 * grow5000;
  const top600 = bars.base - bars.maxHeight * OUTCOME_LEVEL.d600 * grow600;

  // --- Graph line drawing (scene 2) ---
  const lineDraw = interpolate(sec, [CUE.linesDraw, CUE.linesDrawEnd], [0, 1], {
    ...CLAMP,
    easing: EASE.inOut,
  });

  // --- Vitamin D sun ---
  const sunBase = morphStates<Placement>(sec, [
    { move: [0, 0], state: { ...LAYOUT.sunHero } },
    {
      move: [CUE.sunToSupport, CUE.sunToSupportEnd],
      state: { ...LAYOUT.sunSupport },
    },
    {
      move: [CUE.toGraph, CUE.linesDraw],
      state: () => {
        const p = pointOnVitaminD(lineDraw);
        return { x: p.x, y: p.y, size: 84 };
      },
    },
    {
      move: [CUE.sunToHub, CUE.sunToHubEnd],
      state: { x: LAYOUT.cellsHub.x, y: LAYOUT.cellsHub.y, size: 150 },
    },
    {
      move: [CUE.sunToBadge, CUE.sunToBadgeEnd],
      state: { ...LAYOUT.sunBadge },
    },
    { move: [CUE.toMri, CUE.toMriEnd], state: { ...LAYOUT.sunMri } },
    {
      move: [CUE.toBars, CUE.toBarsEnd + 0.05],
      state: () => ({ x: bars.x5000, y: top5000 - 70, size: 112 }),
    },
    {
      move: [CUE.finale, CUE.finaleEnd - 0.4],
      state: { ...LAYOUT.sunSupport },
    },
  ]);
  const sun = {
    ...sunBase,
    size: sunBase.size * sp(CUE.sunIn, { damping: 12, stiffness: 110 }),
    rays: interpolate(sec, [CUE.sunIn + 0.15, CUE.sunIn + 0.8], [0, 1], {
      ...CLAMP,
      easing: EASE.out,
    }),
    spin: sec * 10,
    glow: track(frame, fps, [
      [0, 1],
      [CUE.sunToSupport, 1],
      [CUE.sunToSupportEnd, 0.45],
      [CUE.regulationStart, 0.45],
      [CUE.regulationStart + 0.3, 0.9],
      [CUE.calmEnd + 0.3, 0.5],
    ]),
  };

  // Second, smaller sun for the 600 IU/day column; it merges back at the finale.
  const smallSunBase = morphStates<Placement>(sec, [
    { move: [0, 0], state: () => ({ x: bars.x600, y: top600 - 52, size: 70 }) },
    {
      move: [CUE.finale, CUE.finale + 0.5],
      state: { ...LAYOUT.sunSupport, size: 120 },
    },
  ]);
  const smallSun = {
    ...smallSunBase,
    size:
      smallSunBase.size *
      sp(CUE.barsGrow - 0.05, { damping: 14, stiffness: 120 }),
    opacity: track(frame, fps, [
      [CUE.finale + 0.2, 1],
      [CUE.finale + 0.5, 0],
    ]),
  };

  // --- Nerve / x-axis ---
  const nerve = morphStates<NerveShape>(sec, [
    {
      move: [0, 0],
      state: {
        x: 510,
        y: LAYOUT.nerveIntro.y,
        width: LAYOUT.nerveIntro.width,
        myelin: 1,
        wave: 1,
        opacity: 1,
      },
    },
    {
      move: [CUE.sunToSupport, CUE.sunToSupportEnd],
      state: {
        x: 510,
        y: LAYOUT.nerveHero.y,
        width: LAYOUT.nerveHero.width,
        myelin: 1,
        wave: 1,
        opacity: 1,
      },
    },
    {
      move: [CUE.toGraph, CUE.toGraphEnd],
      state: {
        x: 540,
        y: LAYOUT.graph.bottom,
        width: LAYOUT.graph.right - LAYOUT.graph.left,
        myelin: 0,
        wave: 0,
        opacity: 1,
      },
    },
    {
      move: [CUE.toCells, CUE.toCellsEnd],
      state: {
        x: 505,
        y: LAYOUT.cellsHub.y,
        width: 380,
        myelin: 1,
        wave: 1,
        opacity: 1,
      },
    },
    {
      move: [CUE.cellsMerge, CUE.cellsMerge + 0.45],
      state: {
        x: 540,
        y: LAYOUT.cellsHub.y,
        width: 280,
        myelin: 0,
        wave: 0,
        opacity: 0,
      },
    },
    {
      move: [CUE.finale + 0.3, CUE.finaleEnd],
      state: {
        x: 510,
        y: LAYOUT.nerveHero.y,
        width: LAYOUT.nerveHero.width,
        myelin: 1,
        wave: 1,
        opacity: 1,
      },
    },
  ]);
  const nerveState = {
    ...nerve,
    draw: interpolate(sec, [CUE.nerveDraw, CUE.nerveDrawEnd], [0, 1], {
      ...CLAMP,
      easing: EASE.inOut,
    }),
    myelin:
      nerve.myelin *
      interpolate(
        sec,
        [CUE.nerveDraw + 0.35, CUE.nerveDrawEnd + 0.2],
        [0, 1],
        CLAMP,
      ),
    phase: sec * 1.2,
  };

  // --- Data dots → immune cells ---
  const chaos = track(frame, fps, [
    [CUE.toCells + 0.3, 0],
    [CUE.toCellsEnd + 0.1, 28],
    [CUE.regulationStart, 28],
    [CUE.calmEnd, 4],
  ]);
  const activation = track(frame, fps, [
    [CUE.toCells + 0.25, 0],
    [CUE.toCellsEnd + 0.1, 1],
    [CUE.regulationStart, 1],
    [CUE.calmEnd, 0],
  ]);
  const rotation = sec * 0.22;
  const cells: CellState[] = DOT_FRACTIONS.map((f, i) => {
    const tipTime = CUE.linesDraw + f * (CUE.linesDrawEnd - CUE.linesDraw);
    const pop = sp(tipTime, { damping: 12, stiffness: 160 });
    const dot = pointOnMS(f);
    const angle = (i / DOT_FRACTIONS.length) * Math.PI * 2 + rotation;
    const w1 = 4 + random(`w1-${i}`) * 4;
    const w2 = 4 + random(`w2-${i}`) * 4;
    const ph = random(`ph-${i}`) * Math.PI * 2;
    const orbit = {
      x:
        LAYOUT.cellsHub.x +
        Math.cos(angle) * LAYOUT.cellsHub.rx +
        Math.sin(sec * w1 + ph) * chaos,
      y:
        LAYOUT.cellsHub.y +
        Math.sin(angle) * LAYOUT.cellsHub.ry +
        Math.cos(sec * w2 + ph) * chaos,
    };
    const stagger = i * 0.04;
    const toOrbit = interpolate(
      sec,
      [CUE.toCells + stagger, CUE.toCellsEnd + stagger],
      [0, 1],
      { ...CLAMP, easing: EASE.inOut },
    );
    const merge = interpolate(
      sec,
      [CUE.cellsMerge + stagger * 0.5, CUE.cellsMergeEnd],
      [0, 1],
      { ...CLAMP, easing: EASE.inOut },
    );
    const x0 = dot.x + (orbit.x - dot.x) * toOrbit;
    const y0 = dot.y + (orbit.y - dot.y) * toOrbit;
    return {
      x: x0 + (LAYOUT.card.x - x0) * merge,
      y: y0 + (LAYOUT.card.y - y0) * merge,
      r: (11 * pop + (40 - 11) * toOrbit) * (1 - 0.7 * merge),
      activation,
      detail: toOrbit,
      opacity: 1 - interpolate(merge, [0.6, 1], [0, 1], CLAMP),
      spin: sec * 18 * (1 + activation) + i * 20,
    };
  });

  // --- Morphing panel: treatment card → MRI screen → comparison card → nerve line ---
  const panel = morphStates<PanelShape>(sec, [
    {
      move: [0, 0],
      state: {
        x: LAYOUT.card.x,
        y: LAYOUT.card.y,
        w: 0,
        h: 0,
        radius: 40,
        dark: 0,
        opacity: 1,
      },
    },
    {
      move: [CUE.cardIn, CUE.cardIn + 0.55],
      state: { ...LAYOUT.card, radius: 64, dark: 0, opacity: 1 },
      easing: BACK_OUT,
    },
    {
      move: [CUE.toMri, CUE.toMriEnd],
      state: { ...LAYOUT.mri, radius: 44, dark: 1, opacity: 1 },
    },
    {
      move: [CUE.toBars, CUE.toBarsEnd],
      state: { ...LAYOUT.compare, radius: 48, dark: 0, opacity: 1 },
    },
    {
      move: [CUE.finale + 0.05, CUE.finale + 0.4],
      state: {
        x: 510,
        y: LAYOUT.nerveHero.y,
        w: LAYOUT.nerveHero.width,
        h: 14,
        radius: 7,
        dark: 0,
        opacity: 1,
      },
    },
    {
      move: [CUE.finale + 0.4, CUE.finale + 0.65],
      state: {
        x: 510,
        y: LAYOUT.nerveHero.y,
        w: LAYOUT.nerveHero.width,
        h: 14,
        radius: 7,
        dark: 0,
        opacity: 0,
      },
    },
  ]);

  return {
    sec,
    sun,
    smallSun,
    nerve: nerveState,
    cells,
    panel,
    lineDraw,
    grow5000,
    grow600,
    sp,
  };
};
