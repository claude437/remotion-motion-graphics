#!/usr/bin/env node
/**
 * Writes a sound-effect cue sheet (CSV) from a video's timeline.ts (the single
 * source of truth), so SFX can be re-placed after the picture is slowed down.
 *
 *   npm run render:tayibat:cues            # → renders/tayibat-ms-30s-sfx-cues.csv
 *   npm run render:tayibat:cues -- 0.8     # also list times for a 0.8× slowed edit
 *   npm run render:ms-walking:cues -- 0.8  # → renders/ms-walking-39s-sfx-cues.csv
 *
 * Requires Node ≥ 22.18 (built-in TypeScript type stripping).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const VIDEOS = {
  "tayibat-ms": "tayibat-ms-30s-sfx-cues.csv",
  "ms-walking": "ms-walking-39s-sfx-cues.csv",
};
const args = process.argv.slice(2);
const video =
  args.find((a) => a.startsWith("--video="))?.slice(8) ?? "tayibat-ms";
if (!VIDEOS[video]) {
  console.error(`Unknown video "${video}". Use one of: ${Object.keys(VIDEOS).join(", ")}`);
  process.exit(1);
}
const { SFX, FORMAT, sfxTime } = await import(
  path.join(root, `src/videos/${video}/timeline.ts`)
);
// Cues may be absolute (`at`) or scene-relative (resolved by the timeline's sfxTime()).
const timeOf = (c) => (sfxTime ? sfxTime(c) : c.at);
const speed = Number(args.find((a) => !a.startsWith("--")) ?? 1);
if (!Number.isFinite(speed) || speed <= 0) {
  console.error(
    "Speed must be a positive number, e.g. 0.8 for a 0.8× (slower) edit.",
  );
  process.exit(1);
}

const files = {
  whoosh: "whoosh.mp3",
  click: "click.mp3",
  pulse: "pulse.mp3",
  liquid: "liquid.mp3",
};
const tc = (s) => {
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return `${String(m).padStart(2, "0")}:${rest.toFixed(3).padStart(6, "0")}`;
};

const rows = [...SFX]
  .map((c) => ({ ...c, at: timeOf(c) }))
  .sort((a, b) => a.at - b.at)
  .map((c, i) => [
    i + 1,
    c.at.toFixed(3),
    Math.round(c.at * FORMAT.fps),
    tc(c.at),
    (c.at / speed).toFixed(3),
    c.sound,
    `public/audio/${files[c.sound]}`,
    c.volume,
    `"${c.label.replace(/"/g, '""')}"`,
  ]);
const header = [
  "#",
  "time_s",
  `frame_${FORMAT.fps}fps`,
  "timecode",
  `time_at_${speed}x_s`,
  "sound",
  "file",
  "volume",
  "label",
];
const csv = [header, ...rows].map((r) => r.join(",")).join("\n") + "\n";

const out = path.join(root, "renders", VIDEOS[video]);
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, csv);
console.log(`Wrote ${rows.length} SFX cues → ${path.relative(root, out)}`);
