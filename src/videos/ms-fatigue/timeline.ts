/**
 * Single source of truth for MSFatigue: format, scene windows, headings,
 * image assets, layout anchors and SFX cues. All times in seconds.
 *
 * Dependency-free on purpose (read by scripts/export-sfx-cues.mjs).
 * To retime for a voice-over, edit the scene [start, end] values below; every
 * animation cue in MSFatigue.tsx is written relative to a scene start.
 */

export const FORMAT = {
  id: "MSFatigue",
  width: 1080,
  height: 1920,
  fps: 60,
  seconds: 70,
} as const;

export const SCENES = {
  poll: [0, 5],
  topic: [5, 8],
  morning: [8, 13],
  research: [13, 17],
  factors: [17, 23],
  help: [23, 26],
  move: [26, 32],
  resistance: [32, 36],
  pacing: [36, 41],
  sleep: [41, 46],
  doctor: [46, 52],
  creatine: [52, 56],
  carnitine: [56, 60],
  family: [60, 66],
  comments: [66, 68],
  next: [68, 70],
} as const;

export type SceneId = keyof typeof SCENES;

/**
 * Headings: shown from `scene start + in` until `scene end + out` (out ≤ 0;
 * omitted = stays to the end). `until` makes `out` refer to a later scene.
 */
export const HEADINGS: ReadonlyArray<{
  readonly scene: SceneId;
  readonly until?: SceneId;
  readonly in: number;
  readonly out?: number;
  readonly title: string;
  readonly small?: string;
  readonly size?: number;
  /** Second line size (default 46, regular weight); larger = bold. */
  readonly smallSize?: number;
}> = [
  { scene: "poll", in: 0.25, out: -0.45, title: "نكمل سلسلة مشاكل الـMS", size: 70 },
  { scene: "topic", in: 0.2, out: -0.4, title: "الإرهاق الشديد", size: 92 },
  { scene: "morning", in: 0.15, out: -0.4, title: "تعب… حتى من غير مجهود", small: "ممكن يحصل عند بعض المرضى", size: 68 },
  { scene: "research", in: 0.15, out: -0.4, title: "عرض شائع… وأسبابه متعددة", size: 64 },
  { scene: "factors", in: 0.2, out: -0.45, title: "حاجات ممكن تزوّده", size: 80 },
  { scene: "help", in: 0.15, out: -0.35, title: "طيب… نعمل إيه؟" },
  { scene: "move", in: 0.15, out: -0.35, title: "١ — الحركة المنتظمة", size: 80 },
  { scene: "resistance", in: 0.15, out: -0.35, title: "تمارين متدرجة… حسب قدرتك", size: 62 },
  { scene: "pacing", in: 0.15, out: -0.35, title: "٢ — وزّع مجهودك", small: "راحة قبل الإنهاك", size: 80 },
  { scene: "sleep", in: 0.15, out: -0.35, title: "٣ — نوم أفضل وحرارة أقل", size: 66 },
  { scene: "doctor", in: 0.15, out: -0.35, title: "تعب مستمر أو زيادة؟", small: "راجع طبيبك", smallSize: 64, size: 72 },
  { scene: "creatine", until: "carnitine", in: 0.15, out: -0.4, title: "من تجربتي الشخصية", size: 76 },
  { scene: "family", in: 0.15, out: -3.1, title: "فَهّم اللي حواليك", size: 80 },
  { scene: "family", in: 3.0, out: -0.35, title: "الإرهاق مش كسل", size: 84 },
  { scene: "comments", in: 0.1, out: -0.3, title: "إمتى بتحس بالإرهاق؟", small: "وإيه اللي ساعدك؟", size: 76 },
  { scene: "next", in: 0.15, title: "مشكلة جديدة… الفيديو الجاي", size: 62 },
];

/** Essential content stays inside this box (px). */
export const SAFE = { left: 90, right: 900, top: 240, bottom: 1560 } as const;

/** Original attachments, shown unmodified (byte-identical copies). */
export const ASSETS = {
  poll: { src: "images/ms-my-story/poll.png", w: 745, h: 765 },
  /** «الإرهاق الشديد — 18%» row box in poll-image pixels (measured from the file). */
  fatigueRow: { x: 16, y: 269, w: 704, h: 64 },
  research: { src: "images/ms-fatigue/research-fatigue-prevalence.png", w: 827, h: 679 },
  creatine: { src: "images/ms-fatigue/creatine.png", w: 600, h: 600 },
  carnitine: { src: "images/ms-fatigue/l-carnitine.png", w: 351, h: 468 },
} as const;

export const LAYOUT = {
  cx: 495,
  textTop: 262,
  seriesCards: { xs: [760, 495, 230], y: 820, w: 240, h: 180 },
  pollCard: { x: 495, y: 930, w: 810, h: 822 },
  researchCard: { x: 495, y: 925, w: 810, h: 672 },
  battery: { x: 495, y: 1000, w: 300, h: 150 },
  bed: { cx: 495, floor: 1300 },
  floor: 1250,
  board: { x: 495, y: 820, w: 780, h: 300 },
  strip: { x: 495, y: 548, w: 600, h: 104 },
  productSolo: { x: 495, y: 905, w: 560, h: 680 },
  productLeft: { x: 285, y: 880, w: 370, h: 520 },
  productRight: { x: 705, y: 880, w: 370, h: 520 },
  doctorCard: { x: 495, y: 820, w: 540, h: 300 },
  commentCard: { x: 495, y: 880, w: 620, h: 280 },
} as const;

export type SfxName = "whoosh" | "click" | "pulse";

/** Optional subtle SFX, rendered as a separate stem. `at` = seconds from the scene start. */
export const SFX: ReadonlyArray<{
  readonly scene: SceneId;
  readonly at: number;
  readonly sound: SfxName;
  readonly volume: number;
  readonly label: string;
}> = [
  { scene: "poll", at: 0.15, sound: "whoosh", volume: 0.16, label: "Series cards" },
  { scene: "poll", at: 1.15, sound: "whoosh", volume: 0.16, label: "Card → poll" },
  { scene: "poll", at: 2.6, sound: "click", volume: 0.24, label: "Fatigue row outlined" },
  { scene: "topic", at: -0.05, sound: "whoosh", volume: 0.18, label: "Outline → battery" },
  { scene: "morning", at: 0.05, sound: "whoosh", volume: 0.14, label: "Battery → bed" },
  { scene: "research", at: -0.05, sound: "whoosh", volume: 0.16, label: "Blanket → research card" },
  { scene: "factors", at: 0.6, sound: "click", volume: 0.2, label: "Factor: sleep" },
  { scene: "factors", at: 1.7, sound: "click", volume: 0.2, label: "Factor: pain" },
  { scene: "factors", at: 2.8, sound: "click", volume: 0.2, label: "Factor: medicines" },
  { scene: "factors", at: 3.9, sound: "click", volume: 0.2, label: "Factor: heat" },
  { scene: "help", at: -0.05, sound: "whoosh", volume: 0.16, label: "Connectors → routine board" },
  { scene: "help", at: 1.0, sound: "click", volume: 0.2, label: "Node 1 active" },
  { scene: "move", at: 1.2, sound: "pulse", volume: 0.16, label: "Calendar day" },
  { scene: "resistance", at: -0.05, sound: "whoosh", volume: 0.14, label: "Track → band" },
  { scene: "pacing", at: 1.3, sound: "click", volume: 0.2, label: "Task card splits" },
  { scene: "sleep", at: 0.0, sound: "whoosh", volume: 0.14, label: "Rest marker → moon" },
  { scene: "doctor", at: -0.05, sound: "whoosh", volume: 0.16, label: "Fan → doctor card" },
  { scene: "doctor", at: 1.6, sound: "click", volume: 0.2, label: "Assessment icons" },
  { scene: "creatine", at: -0.05, sound: "whoosh", volume: 0.16, label: "Card → creatine" },
  { scene: "carnitine", at: -0.05, sound: "whoosh", volume: 0.16, label: "Creatine aside, L-carnitine in" },
  { scene: "family", at: -0.1, sound: "whoosh", volume: 0.14, label: "Connector → home" },
  { scene: "comments", at: -0.1, sound: "whoosh", volume: 0.14, label: "Bubble → comment card" },
  { scene: "next", at: -0.1, sound: "whoosh", volume: 0.14, label: "Series cards return" },
  { scene: "next", at: 0.7, sound: "pulse", volume: 0.14, label: "Next card highlight" },
];

/** Absolute time (s) of an SFX cue. */
export const sfxTime = (c: { readonly scene: SceneId; readonly at: number }) =>
  SCENES[c.scene][0] + c.at;
