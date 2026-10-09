/**
 * Single source of truth for MSWalking: format, every scene window, headings,
 * layout anchors, image-asset metadata and SFX cues. All times in seconds.
 *
 * Dependency-free on purpose (read by scripts/export-sfx-cues.mjs).
 * To retime, edit the scene [start, end] values below; all animation cues
 * inside the composition are written relative to these windows.
 */

export const FORMAT = {
  id: "MSWalking",
  width: 1080,
  height: 1920,
  fps: 60,
  seconds: 39,
} as const;

export const SCENES = {
  page: [0, 3],
  poll: [3, 6],
  series: [6, 8],
  effort: [8, 10],
  signal: [10, 13],
  disrupted: [13, 16],
  symptoms: [16, 19],
  support: [19, 21],
  follow: [21, 23],
  move: [23, 25],
  balance: [25, 27],
  strength: [27, 30],
  context: [30, 33],
  doctor: [33, 35],
  comments: [35, 37],
  next: [37, 39],
} as const;

export type SceneId = keyof typeof SCENES;

/**
 * Headings: shown from `scene start + in` until `scene end + out` (out ≤ 0;
 * omitted = stays to the end). Relative, so retiming a scene moves its text.
 */
export const HEADINGS: ReadonlyArray<{
  readonly scene: SceneId;
  /** Optional later scene whose end the `out` offset refers to. */
  readonly until?: SceneId;
  readonly in: number;
  readonly out?: number;
  readonly title: string;
  readonly small?: string;
  readonly size?: number;
}> = [
  { scene: "page", in: 0.25, out: -0.45, title: "سؤال لمرضى الـMS" },
  { scene: "series", in: 0.1, out: -1.15, title: "مشكلة… كل فيديو" },
  { scene: "series", in: 1.0, until: "effort", out: -0.4, title: "صعوبة المشي" },
  { scene: "signal", in: 0.1, out: -0.4, title: "إشارات الحركة" },
  { scene: "disrupted", in: 0.1, out: -0.4, title: "الإشارة ممكن تتعطّل" },
  { scene: "symptoms", in: 0.3, out: -0.5, title: "أعراض ممكن تظهر" },
  { scene: "support", in: 0.15, out: -0.5, title: "العلاج الطبيعي ممكن يساعد", size: 66 },
  // "MS my story" uses non-breaking spaces so the Latin name stays one LTR token.
  { scene: "follow", in: 0.15, out: -0.4, title: "تابعوا MS\u00A0my\u00A0story", small: "تمارين مناسبة لحالتك" },
  { scene: "move", in: 0.15, out: -0.35, title: "١ — حركة على قدّك", small: "فترات قصيرة + راحة" },
  { scene: "balance", in: 0.15, out: -0.35, title: "٢ — درّب توازنك", small: "دعم ثابت وإشراف عند الحاجة" },
  { scene: "strength", in: 0.15, out: -0.35, title: "٣ — قوّي رجليك", small: "حسب قدرتك وحالتك" },
  { scene: "context", in: 0.15, out: -1.6, title: "مش كل مريض بيعاني منها", size: 74 },
  { scene: "context", in: 1.55, out: -0.35, title: "صعوبة المشي ≠", small: "بالضرورة تطوّر المرض", size: 80 },
  { scene: "doctor", in: 0.15, out: -0.35, title: "مشكلة جديدة؟ بلّغ طبيبك", small: "خصوصًا لو مفاجئة أو بتزيد بسرعة", size: 72 },
  { scene: "comments", in: 0.15, out: -0.35, title: "إيه أكتر حاجة ساعدتك؟", size: 80 },
  { scene: "next", in: 0.15, title: "المشكلة الجاية… قريب", size: 80 },
];

/** Essential content stays inside this box (px). */
export const SAFE = { left: 90, right: 900, top: 240, bottom: 1560 } as const;

/** Original image assets (byte-identical copies of the attachments). */
export const ASSETS = {
  header: { src: "images/ms-my-story/page-header.png", w: 1389, h: 237 },
  poll: { src: "images/ms-my-story/poll.png", w: 745, h: 765 },
  /** «صعوبة المشي — 26%» row box in poll-image pixels (measured from the file). */
  walkingRow: { x: 16, y: 198, w: 704, h: 64 },
  /** Logo + page-name region center in header-image pixels (zoom focus). */
  headerFocus: { x: 285, y: 118 },
} as const;

export const LAYOUT = {
  cx: 495,
  textTop: 262,
  floor: 1200,
  floorX: [120, 880] as const,
  topicCards: [
    { x: 745, y: 575 },
    { x: 495, y: 575 },
    { x: 245, y: 575 },
  ],
  topicCard: { w: 210, h: 150 },
  headerCard: { x: 495, y: 780, w: 810, h: 168 },
  headerCardZoom: { x: 495, y: 800, w: 810, h: 290 },
  headerCardFollow: { x: 495, y: 612, w: 810, h: 290 },
  /** Header zoom: image scale and focus (logo + page name), in image px. */
  headerZoom: { scale: 1.4, x: 285, y: 125 },
  pollCard: { x: 495, y: 925, w: 810, h: 822 },
  rehabCard: { x: 495, y: 915, w: 800, h: 600 },
  contactCard: { x: 695, y: 800, w: 330, h: 300 },
  bubble: { x: 690, y: 760, w: 360, h: 220 },
  nextCards: { xs: [760, 495, 230], y: 860, w: 240, h: 180 },
  brain: { x: 640, y: 575 },
  cordBottom: 930,
  lens: { x: 495, y: 915, r: 330 },
  chair: 420,
  railX: 205,
} as const;

export type SfxName = "whoosh" | "click" | "pulse";

/** Optional subtle SFX (rendered to a separate stem for retiming). `at` is seconds from the scene start. */
export const SFX: ReadonlyArray<{
  readonly scene: SceneId;
  readonly at: number;
  readonly sound: SfxName;
  readonly volume: number;
  readonly label: string;
}> = [
  { scene: "page", at: 0.15, sound: "whoosh", volume: 0.16, label: "Page card enters" },
  { scene: "page", at: 1.9, sound: "click", volume: 0.22, label: "Question bubble" },
  { scene: "poll", at: -0.55, sound: "whoosh", volume: 0.18, label: "Card → poll" },
  { scene: "poll", at: 0.7, sound: "click", volume: 0.24, label: "Walking row outlined" },
  { scene: "series", at: -0.55, sound: "whoosh", volume: 0.18, label: "Outline → pathway" },
  { scene: "series", at: 0.4, sound: "click", volume: 0.2, label: "Topic card active" },
  { scene: "signal", at: -0.05, sound: "whoosh", volume: 0.16, label: "Pathway → CNS" },
  { scene: "signal", at: 0.9, sound: "pulse", volume: 0.22, label: "Motor signal" },
  { scene: "disrupted", at: 0.05, sound: "whoosh", volume: 0.16, label: "Magnify nerve" },
  { scene: "disrupted", at: 1.2, sound: "pulse", volume: 0.18, label: "Signal stalls" },
  { scene: "symptoms", at: 0.55, sound: "click", volume: 0.2, label: "Symptom: weakness" },
  { scene: "symptoms", at: 1.05, sound: "click", volume: 0.2, label: "Symptom: stiffness" },
  { scene: "symptoms", at: 1.55, sound: "click", volume: 0.2, label: "Symptom: balance" },
  { scene: "symptoms", at: 2.05, sound: "click", volume: 0.2, label: "Symptom: foot lift" },
  { scene: "support", at: -0.45, sound: "whoosh", volume: 0.16, label: "Icons → rehab card" },
  { scene: "follow", at: -0.55, sound: "whoosh", volume: 0.16, label: "Rehab → page card" },
  { scene: "move", at: -0.45, sound: "whoosh", volume: 0.16, label: "Card edge → track" },
  { scene: "balance", at: 0.3, sound: "click", volume: 0.2, label: "Hand on chair" },
  { scene: "strength", at: 1.6, sound: "click", volume: 0.2, label: "Hands on rail" },
  { scene: "context", at: -0.35, sound: "whoosh", volume: 0.16, label: "Figure → three" },
  { scene: "doctor", at: 0.3, sound: "pulse", volume: 0.2, label: "New symptom marker" },
  { scene: "comments", at: -0.35, sound: "whoosh", volume: 0.16, label: "Card → comment" },
  { scene: "comments", at: 0.6, sound: "click", volume: 0.2, label: "Response bubble" },
  { scene: "comments", at: 1, sound: "click", volume: 0.2, label: "Response bubble" },
  { scene: "next", at: -0.35, sound: "whoosh", volume: 0.16, label: "Back to topic cards" },
  { scene: "next", at: 0.7, sound: "pulse", volume: 0.16, label: "Next card highlight" },
];

/** Absolute time (s) of an SFX cue. */
export const sfxTime = (c: { readonly scene: SceneId; readonly at: number }) => SCENES[c.scene][0] + c.at;
