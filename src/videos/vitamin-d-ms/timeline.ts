/**
 * Single source of truth for the VitaminDMS video: format, scene windows,
 * every animation cue and the layout anchors that objects travel between.
 *
 * All times are in SECONDS (converted to frames with the composition fps).
 * Cues are written relative to their scene start, so moving a scene boundary
 * moves everything inside it.
 */

export const FORMAT = {
  id: "VitaminDMS",
  width: 1080,
  height: 1920,
  fps: 60,
  seconds: 16,
} as const;

/** Scene windows [start, end] in seconds. They tile the 16 s exactly. */
export const SCENES = {
  vitaminD: { start: 0, end: 2.5 },
  association: { start: 2.5, end: 5 },
  immune: { start: 5, end: 7.5 },
  treatment: { start: 7.5, end: 10 },
  mri: { start: 10, end: 12.5 },
  dose: { start: 12.5, end: 16 },
} as const;

const s1 = SCENES.vitaminD.start;
const s2 = SCENES.association.start;
const s3 = SCENES.immune.start;
const s4 = SCENES.treatment.start;
const s5 = SCENES.mri.start;
const s6 = SCENES.dose.start;

/** Absolute cue times in seconds. */
export const CUE = {
  // Scene 1: Vitamin D appears important, then steps back into a supporting role.
  sunIn: s1 + 0.1,
  title1In: s1 + 0.3,
  nerveDraw: s1 + 0.55,
  nerveDrawEnd: s1 + 1.5,
  sunToSupport: s1 + 1.3,
  sunToSupportEnd: s1 + 2.0,
  title1Out: s1 + 1.3,
  notMagicIn: s1 + 1.45,
  connectorIn: s1 + 1.85,

  // Scene 2: nerve flattens into the x-axis, two trend lines draw (association only).
  toGraph: s2,
  toGraphEnd: s2 + 0.55,
  axisIn: s2 + 0.35,
  linesDraw: s2 + 0.6,
  linesDrawEnd: s2 + 1.9,
  title2In: s2 + 0.15,
  legendIn: s2 + 0.7,

  // Scene 3: graph dots become immune cells; Vitamin D regulates and calms them.
  toCells: s3,
  toCellsEnd: s3 + 0.7,
  sunToHub: s3 + 0.2,
  sunToHubEnd: s3 + 0.9,
  title3In: s3 + 0.15,
  regulationStart: s3 + 1.1,
  pulses: [s3 + 1.1, s3 + 1.6, s3 + 2.1],
  calmEnd: s3 + 2.1,

  // Scene 4: cells merge into the standard-treatment card; Vitamin D sits beside it.
  cellsMerge: s4 - 0.1,
  cellsMergeEnd: s4 + 0.35,
  cardIn: s4 + 0.3,
  sunToBadge: s4 + 0.1,
  sunToBadgeEnd: s4 + 0.8,
  title4In: s4 + 0.2,
  chipSupportIn: s4 + 1.0,
  chipReplaceIn: s4 + 1.4,

  // Scene 5: the card morphs into an MRI interface; small study cards appear.
  toMri: s5,
  toMriEnd: s5 + 0.6,
  brainDraw: s5 + 0.3,
  brainDrawEnd: s5 + 1.0,
  scan: s5 + 0.6,
  scanEnd: s5 + 1.4,
  studyCards: [s5 + 0.75, s5 + 0.9, s5 + 1.05],
  improve: s5 + 1.6,
  improveEnd: s5 + 2.3,
  title5In: s5 + 0.15,

  // Scene 6: the MRI panel morphs into a dose comparison, then resolves.
  toBars: s6,
  toBarsEnd: s6 + 0.5,
  barsGrow: s6 + 0.55,
  barsGrowEnd: s6 + 1.6,
  levelLineIn: s6 + 1.55,
  relapseIn: s6 + 1.65,
  relapseEnd: s6 + 2.2,
  title6In: s6 + 0.15,
  finale: s6 + 2.4,
  finaleEnd: s6 + 3.1,
  finalTextIn: s6 + 2.75,
} as const;

/** Moments where one scene flows into the next (ring + soft whoosh). */
export const TRANSITIONS = [
  { at: s2, x: 540, y: 900 },
  { at: s3, x: 540, y: 1000 },
  { at: s4, x: 540, y: 1000 },
  { at: s5, x: 540, y: 900 },
  { at: s6, x: 540, y: 990 },
  { at: CUE.finale, x: 540, y: 1080 },
] as const;

/**
 * TikTok-safe content zone (px). Top: status bar + tabs; bottom: caption,
 * music ticker and nav; right: like/comment/share rail.
 */
export const SAFE = { top: 250, bottom: 1560, left: 100, right: 960 } as const;

/** Positions and sizes that the persistent objects move between. */
export const LAYOUT = {
  center: 540,
  textTop: 270,
  sunHero: { x: 540, y: 820, size: 420 },
  sunSupport: { x: 270, y: 760, size: 190 },
  nerveIntro: { y: 1240, width: 660 },
  nerveHero: { y: 1080, width: 680 },
  graph: { left: 140, right: 940, top: 680, bottom: 1250 },
  cellsHub: { x: 540, y: 1000, rx: 335, ry: 265 },
  card: { x: 540, y: 1000, w: 500, h: 500 },
  sunBadge: { x: 800, y: 720, size: 150 },
  mri: { x: 540, y: 900, w: 840, h: 700 },
  sunMri: { x: 830, y: 650, size: 84 },
  compare: { x: 540, y: 990, w: 840, h: 860 },
  bars: { base: 1150, maxHeight: 400, width: 170, x5000: 720, x600: 360 },
} as const;
