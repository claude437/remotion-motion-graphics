/**
 * Single source of truth for VitaminDMS-Part2: format, scene windows, every
 * animation cue and the layout anchors objects move between.
 *
 * All times are in SECONDS, written relative to their scene start, so moving
 * a scene boundary moves everything inside it. Same conventions as Part 1
 * (src/videos/vitamin-d-ms/timeline.ts).
 */

export const FORMAT = {
  id: "VitaminDMS-Part2",
  width: 1080,
  height: 1920,
  fps: 60,
  seconds: 20,
} as const;

/** Scene windows [start, end] in seconds. They tile the 20 s exactly. */
export const SCENES = {
  bones: { start: 0, end: 2.5 },
  test: { start: 2.5, end: 4.5 },
  decision: { start: 4.5, end: 6.5 },
  daily: { start: 6.5, end: 8.5 },
  limit: { start: 8.5, end: 10.8 },
  supervision: { start: 10.8, end: 13 },
  caution: { start: 13, end: 15.5 },
  sources: { start: 15.5, end: 18 },
  summary: { start: 18, end: 20 },
} as const;

const s1 = SCENES.bones.start;
const s2 = SCENES.test.start;
const s3 = SCENES.decision.start;
const s4 = SCENES.daily.start;
const s5 = SCENES.limit.start;
const s6 = SCENES.supervision.start;
const s7 = SCENES.caution.start;
const s8 = SCENES.sources.start;
const s9 = SCENES.summary.start;

/** Absolute cue times in seconds. */
export const CUE = {
  // 1 · Opens on Part 1's final frame; the sun now also supports a bone.
  settle: s1 + 0.15,
  settleEnd: s1 + 0.9,
  boneIn: s1 + 0.35,
  boneDrawEnd: s1 + 1.2,
  title1In: s1 + 0.3,
  boneLinkIn: s1 + 1.0,
  msLabelIn: s1 + 1.3,

  // 2 · Bone → lab card; nerve flattens into the (pending) result track.
  toTest: s2,
  toTestEnd: s2 + 0.55,
  vialFill: s2 + 0.5,
  vialFillEnd: s2 + 1.3,
  stepBadgeIn: s2 + 0.7,
  title2In: s2 + 0.15,

  // 3 · Result reads LOW → test + condition → personalized dose.
  toDecision: s3,
  toDecisionEnd: s3 + 0.5,
  lowMarker: s3 + 0.35,
  inputsIn: s3 + 0.7,
  doseNodeIn: s3 + 1.1,
  title3In: s3 + 0.15,

  // 4 · Track becomes a dose axis; 600–800 IU/day daily range.
  toDaily: s4,
  toDailyEnd: s4 + 0.5,
  rangeIn: s4 + 0.6,
  numberIn: s4 + 0.4,
  title4In: s4 + 0.15,

  // 5 · Safe-zone fills to the 4000 IU/day wall.
  numberSwap: s5,
  zoneFill: s5 + 0.3,
  zoneFillEnd: s5 + 1.1,
  wallIn: s5 + 0.9,
  title5In: s5 + 0.15,

  // 6 · Dose crosses the wall → doctor + tests + follow-up.
  numberOut: s6,
  crossWall: s6 + 0.2,
  crossWallEnd: s6 + 0.85,
  monitorIn: s6 + 0.9,
  followUp: s6 + 1.2,
  followUpEnd: s6 + 2.0,
  title6In: s6 + 0.15,

  // 7 · Calcium rises; two kidney caution icons.
  toCaution: s7,
  toCautionEnd: s7 + 0.5,
  calciumUp: s7 + 0.5,
  calciumUpEnd: s7 + 1.2,
  kidneysIn: [s7 + 1.0, s7 + 1.25],
  title7In: s7 + 0.15,

  // 8 · Card shrinks into the first source cell; the others unfold from it.
  toSources: s8,
  toSourcesEnd: s8 + 0.5,
  cellsIn: [s8 + 0.45, s8 + 0.6, s8 + 0.75],
  title8In: s8 + 0.15,

  // 9 · Resolve: Vitamin D supports the nerve beside the main treatment.
  toSummary: s9,
  toSummaryEnd: s9 + 0.7,
  nerveRedraw: s9 + 0.25,
  nerveRedrawEnd: s9 + 1.0,
  treatmentIn: s9 + 0.3,
  chipsIn: [s9 + 1.0, s9 + 1.3],
  title9In: s9 + 0.2,
} as const;

/** Moments where one scene flows into the next (ring + soft whoosh). */
export const TRANSITIONS = [
  { at: s2, x: 540, y: 980 },
  { at: s3, x: 540, y: 1000 },
  { at: s4, x: 540, y: 1000 },
  { at: s5, x: 540, y: 900 },
  { at: s6, x: 744, y: 1240 },
  { at: s7, x: 540, y: 1000 },
  { at: s8, x: 735, y: 860 },
  { at: s9, x: 540, y: 980 },
] as const;

/** TikTok-safe content zone (px), identical to Part 1. */
export const SAFE = { top: 250, bottom: 1560, left: 100, right: 960 } as const;

/** Dose axis (LTR numeric scale, 0 → 5000 IU), drawn by the flattened nerve. */
export const AXIS = { y: 1240, x0: 200, x1: 880, maxIU: 5000 } as const;
export const xForIU = (iu: number) =>
  AXIS.x0 + (iu / AXIS.maxIU) * (AXIS.x1 - AXIS.x0);

/** Positions and sizes that the persistent objects move between. */
export const LAYOUT = {
  textTop: 270,
  // Part 1's final composition (Part 2 opens on it).
  part1Sun: { x: 270, y: 760, size: 190 },
  part1Nerve: { x: 510, y: 1080, width: 680 },
  bone: { x: 600, y: 900 },
  boneSun: { x: 250, y: 700, size: 160 },
  boneNerve: { x: 540, y: 1300, width: 560 },
  testCard: { x: 540, y: 980, w: 760, h: 640 },
  testSun: { x: 222, y: 775, size: 74 },
  testTrack: { x: 540, y: 1170, width: 600 },
  decisionCard: { x: 540, y: 1000, w: 760, h: 760 },
  meter: { x: 540, y: 790, width: 600, lowX: 330 },
  doseCard: { x: 540, y: 1000, w: 800, h: 720 },
  calciumSun: { x: 300, y: 830, size: 100 },
  cells: [
    { x: 735, y: 860 },
    { x: 345, y: 860 },
    { x: 735, y: 1230 },
    { x: 345, y: 1230 },
  ],
  cellSize: 330,
  finalSun: { x: 290, y: 790, size: 170 },
  finalNerve: { x: 510, y: 1130, width: 640 },
  treatment: { x: 650, y: 800, scale: 0.85 },
} as const;
