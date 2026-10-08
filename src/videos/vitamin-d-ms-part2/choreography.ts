import { interpolate, spring, type SpringConfig } from "remotion";
import { CLAMP, EASE } from "../../lib/animation";
import { BACK_OUT, morphStates } from "../../lib/morph";
import { AXIS, CUE, LAYOUT, xForIU } from "./timeline";

/**
 * Persistent objects for Part 2, continuing Part 1's cast:
 * - the Vitamin D sun becomes the lab icon, the meter marker, then the
 *   DOSE MARKER riding the dose axis (it crosses the 4000 IU wall in scene 6);
 * - the nerve flattens into the result track, then into the dose axis,
 *   and re-myelinates for the final frame;
 * - one off-white panel morphs card → card → card → first source cell.
 */
type Sun = { x: number; y: number; size: number; onLight: number };
type Nerve = {
  x: number;
  y: number;
  width: number;
  myelin: number;
  wave: number;
  opacity: number;
};
type Panel = {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  opacity: number;
};

const cell1 = LAYOUT.cells[0];

export const usePart2Choreography = (frame: number, fps: number) => {
  const sec = frame / fps;
  const sp = (at: number, config: Partial<SpringConfig> = { damping: 200 }) =>
    spring({ frame: frame - at * fps, fps, config });
  const prog = (a: number, b: number, easing = EASE.inOut) =>
    interpolate(sec, [a, b], [0, 1], { ...CLAMP, easing });

  const sunBase = morphStates<Sun>(sec, [
    { move: [0, 0], state: { ...LAYOUT.part1Sun, onLight: 0 } },
    {
      move: [CUE.settle, CUE.settleEnd],
      state: { ...LAYOUT.boneSun, onLight: 0 },
    },
    {
      move: [CUE.toTest, CUE.toTestEnd],
      state: { ...LAYOUT.testSun, onLight: 1 },
    },
    {
      move: [CUE.toDecision, CUE.toDecisionEnd],
      state: { x: LAYOUT.meter.lowX, y: LAYOUT.meter.y, size: 84, onLight: 1 },
    },
    {
      move: [CUE.toDaily, CUE.toDailyEnd],
      state: { x: xForIU(700), y: AXIS.y, size: 84, onLight: 1 },
    },
    {
      move: [CUE.crossWall, CUE.crossWallEnd],
      state: { x: xForIU(4600), y: AXIS.y, size: 84, onLight: 1 },
    },
    {
      move: [CUE.toCaution, CUE.toCautionEnd],
      state: { ...LAYOUT.calciumSun, onLight: 1 },
    },
    {
      move: [CUE.toSources, CUE.toSourcesEnd],
      state: { x: cell1.x, y: cell1.y - 36, size: 160, onLight: 1 },
    },
    {
      move: [CUE.toSummary, CUE.toSummaryEnd],
      state: { ...LAYOUT.finalSun, onLight: 0 },
    },
  ]);
  const sun = {
    ...sunBase,
    spin: sec * 10,
    glow: 0.15 + 0.5 * (1 - sunBase.onLight),
  };

  const nerve = morphStates<Nerve>(sec, [
    {
      move: [0, 0],
      state: { ...LAYOUT.part1Nerve, myelin: 1, wave: 1, opacity: 1 },
    },
    {
      move: [CUE.settle, CUE.settleEnd],
      state: { ...LAYOUT.boneNerve, myelin: 1, wave: 1, opacity: 1 },
    },
    {
      move: [CUE.toTest, CUE.toTestEnd],
      state: { ...LAYOUT.testTrack, myelin: 0, wave: 0, opacity: 1 },
    },
    {
      move: [CUE.toDecision, CUE.toDecisionEnd],
      state: {
        x: LAYOUT.meter.x,
        y: LAYOUT.meter.y,
        width: LAYOUT.meter.width,
        myelin: 0,
        wave: 0,
        opacity: 1,
      },
    },
    {
      move: [CUE.toDaily, CUE.toDailyEnd],
      state: {
        x: (AXIS.x0 + AXIS.x1) / 2,
        y: AXIS.y,
        width: AXIS.x1 - AXIS.x0,
        myelin: 0,
        wave: 0,
        opacity: 1,
      },
    },
    {
      move: [CUE.toCaution, CUE.toCaution + 0.35],
      state: {
        x: (AXIS.x0 + AXIS.x1) / 2,
        y: AXIS.y,
        width: AXIS.x1 - AXIS.x0,
        myelin: 0,
        wave: 0,
        opacity: 0,
      },
    },
    {
      move: [CUE.toSummary - 0.1, CUE.toSummary - 0.05],
      state: { ...LAYOUT.finalNerve, myelin: 0, wave: 1, opacity: 0 },
    },
    {
      move: [CUE.nerveRedraw, CUE.nerveRedrawEnd],
      state: { ...LAYOUT.finalNerve, myelin: 1, wave: 1, opacity: 1 },
    },
  ]);
  const nerveState = {
    ...nerve,
    draw: sec < CUE.toSummary ? 1 : prog(CUE.nerveRedraw, CUE.nerveRedrawEnd),
    phase: sec * 1.2,
  };

  const panel = morphStates<Panel>(sec, [
    {
      move: [0, 0],
      state: {
        x: LAYOUT.bone.x,
        y: LAYOUT.bone.y,
        w: 0,
        h: 0,
        radius: 40,
        opacity: 1,
      },
    },
    {
      move: [CUE.toTest, CUE.toTestEnd],
      state: { ...LAYOUT.testCard, radius: 56, opacity: 1 },
      easing: BACK_OUT,
    },
    {
      move: [CUE.toDecision, CUE.toDecisionEnd],
      state: { ...LAYOUT.decisionCard, radius: 56, opacity: 1 },
    },
    {
      move: [CUE.toDaily, CUE.toDailyEnd],
      state: { ...LAYOUT.doseCard, radius: 56, opacity: 1 },
    },
    {
      move: [CUE.toSources, CUE.toSourcesEnd],
      state: {
        x: cell1.x,
        y: cell1.y,
        w: LAYOUT.cellSize,
        h: LAYOUT.cellSize,
        radius: 40,
        opacity: 1,
      },
    },
    {
      move: [CUE.toSummary, CUE.toSummary + 0.5],
      state: { x: cell1.x, y: cell1.y, w: 0, h: 0, radius: 40, opacity: 0 },
    },
  ]);

  return { sec, sun, nerve: nerveState, panel, sp, prog };
};
