/**
 * Single source of truth for TayibatMS: format, the 15 two-second scenes,
 * their transition windows, headlines, layout anchors and every SFX cue.
 *
 * This file has NO imports on purpose: `scripts/export-sfx-cues.mjs` reads it
 * directly with Node to write an SFX cue sheet for retiming in an editor.
 * All times are in seconds.
 */

export const FORMAT = {
  id: "TayibatMS",
  width: 1080,
  height: 1920,
  fps: 60,
  seconds: 30,
} as const;

/** Every scene lasts exactly 2 s; the morph into the next scene uses its final 0.4 s. */
export const SCENE_SECONDS = 2;
export const TRANSITION_SECONDS = 0.4;

export const SCENES = [
  { id: "hook", text: "ينفع نعتمد عليه؟" },
  { id: "evidence", text: "فين الدليل؟" },
  { id: "notTreatment", text: "مش علاج مثبت" },
  { id: "restriction", text: "منع مجموعات غذائية" },
  { id: "deficiency", text: "نقص عناصر محتمل" },
  { id: "sugar", text: "قلّل السكر المضاف" },
  { id: "inflammation", text: "قلّل عوامل الالتهاب" },
  { id: "smoking", text: "التدخين لازم يتوقف" },
  { id: "secondhand", text: "حتى التدخين السلبي" },
  { id: "hydration", text: "ترطيب كفاية" },
  { id: "medication", text: "ما توقفش دواءك" },
  { id: "activity", text: "خطر رجوع النشاط" },
  { id: "feelingBetter", text: "التحسّن مش دليل كفاية" },
  { id: "balanced", text: "أكل متوازن يناسبك" },
  { id: "final", text: "صحتك وعلاجك" },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

/** Scene n (1-based, as in the brief) → [start, end] and its transition start. */
export const scene = (n: number) => {
  const start = (n - 1) * SCENE_SECONDS;
  const end = start + SCENE_SECONDS;
  return { start, end, out: end - TRANSITION_SECONDS };
};

/** Supporting phrase on the final frame. */
export const FINAL_SUBTITLE = "غذاء متوازن • ترطيب • متابعة";

/** Essential content must stay inside this box (px). */
export const SAFE = { left: 96, right: 900, top: 200, bottom: 1500 } as const;

/** Layout anchors shared by the persistent objects. */
export const LAYOUT = {
  cx: 498, // horizontal center of the safe area
  textTop: 214,
  // Recurring nerve: "lane" along the bottom, "hero" when it is the subject.
  nerveLane: { x: 470, y: 1360, width: 640 },
  nerveHero: { x: 470, y: 900, width: 640 },
  nerveFinal: { x: 470, y: 1210, width: 640 },
  damagedSleeve: 2,
  plateHook: { x: 380, y: 780, r: 220 },
  dietCard: { x: 742, y: 660, w: 236, h: 132 },
  question: { x: 742, y: 1010 },
  plateMain: { x: 498, y: 790, r: 250 },
  plateBalanced: { x: 360, y: 790, r: 220 },
  plateFinal: { x: 330, y: 800, r: 175 },
  papers: { x: 498, y: 800, w: 168, h: 228, spread: 210 },
  tiles: [
    { x: 288, y: 640, filled: true, label: "Fe" },
    { x: 498, y: 640, filled: false, label: "Ca" },
    { x: 708, y: 640, filled: false, label: "B12" },
    { x: 393, y: 850, filled: true, label: "Zn" },
    { x: 603, y: 850, filled: false, label: "ألياف" },
  ],
  tileSize: 172,
  battery: { x: 300, y: 1110 },
  bowel: { x: 700, y: 1110 },
  sugar: {
    spoon: { x: 270, y: 700 },
    pile: { x: 450, y: 960 },
    drink: { x: 720, y: 790 },
  },
  halo: { rx: 300, ry: 160 },
  cigarette: { x: 320, y: 760 },
  shisha: { x: 690, y: 760 },
  shield: { x1: 112, x2: 850, y1: 770, y2: 1030 },
  glass: { x: 498, y: 800, w: 230, h: 360 },
  heat: { x: 230, y: 650 },
  rx: { x: 315, y: 770, w: 300, h: 380 },
  blister: { x: 690, y: 770, w: 270, h: 380 },
  mri: { x: 640, y: 790, w: 480, h: 560 },
  energy: { x: 230, y: 790 },
  followUp: { x: 470, y: 1190 },
  checklist: { x: 742, y: 740, w: 250, h: 330 },
  calmBowel: { x: 742, y: 1060 },
  finalGlass: { x: 640, y: 790 },
  finalShield: { x: 806, y: 795, scale: 0.52 },
} as const;

export type SfxName = "whoosh" | "click" | "pulse" | "liquid";

/** All sound effects. Every cue sits on a visual event so it can be retimed 1:1. */
export const SFX: ReadonlyArray<{
  readonly at: number;
  readonly sound: SfxName;
  readonly volume: number;
  readonly label: string;
}> = [
  // Soft whoosh at the start of each scene-to-scene morph.
  ...Array.from({ length: SCENES.length - 1 }, (_, i) => ({
    at: scene(i + 1).out,
    sound: "whoosh" as const,
    volume: 0.2,
    label: `Morph ${i + 1}→${i + 2}`,
  })),
  { at: 0.55, sound: "click", volume: 0.3, label: "Diet card appears" },
  { at: 1.0, sound: "pulse", volume: 0.24, label: "Nerve signal" },
  { at: 2.25, sound: "click", volume: 0.26, label: "Research cards unfold" },
  { at: 3.25, sound: "click", volume: 0.3, label: "Magnifier settles on ?" },
  { at: 4.9, sound: "pulse", volume: 0.2, label: "Diet symbol stops short" },
  { at: 6.7, sound: "click", volume: 0.24, label: "Food groups slide away" },
  { at: 8.3, sound: "click", volume: 0.26, label: "Nutrient tiles" },
  { at: 8.9, sound: "pulse", volume: 0.2, label: "Low battery" },
  { at: 10.35, sound: "liquid", volume: 0.16, label: "Sweetened drink" },
  { at: 10.45, sound: "click", volume: 0.22, label: "Sugar cube drop" },
  { at: 10.75, sound: "click", volume: 0.22, label: "Sugar cube drop" },
  { at: 11.1, sound: "click", volume: 0.26, label: "Pile reduces" },
  { at: 12.4, sound: "pulse", volume: 0.24, label: "Inflammatory halo" },
  { at: 14.75, sound: "click", volume: 0.3, label: "Prohibition stroke" },
  { at: 16.45, sound: "pulse", volume: 0.24, label: "Protective boundary" },
  { at: 18.2, sound: "liquid", volume: 0.34, label: "Glass fills" },
  { at: 19.15, sound: "click", volume: 0.22, label: "Bowel icon" },
  { at: 20.35, sound: "click", volume: 0.26, label: "Prescription + blister" },
  { at: 21.0, sound: "click", volume: 0.34, label: "Stop bracket" },
  { at: 22.35, sound: "pulse", volume: 0.24, label: "Irregular signal" },
  { at: 22.95, sound: "pulse", volume: 0.2, label: "Irregular signal" },
  { at: 24.4, sound: "click", volume: 0.24, label: "MRI card" },
  { at: 24.9, sound: "pulse", volume: 0.2, label: "Energy improves" },
  { at: 26.5, sound: "click", volume: 0.2, label: "Checklist tick" },
  { at: 26.85, sound: "click", volume: 0.2, label: "Checklist tick" },
  { at: 27.2, sound: "click", volume: 0.2, label: "Checklist tick" },
  { at: 28.3, sound: "liquid", volume: 0.14, label: "Final glass" },
  { at: 29.4, sound: "pulse", volume: 0.2, label: "Final settle" },
];
