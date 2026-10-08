/**
 * Global video settings. Change resolution, frame rate and scene lengths here;
 * every composition and scene reads from this file.
 *
 * All scene timing inside components is written in seconds (`n * fps`), so
 * changing `fps` keeps animations at the same real-world speed.
 */
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

/**
 * Scene lengths of the sample `Showcase` video, in seconds.
 * Transitions overlap neighbouring scenes, so the total duration is
 * `sum(scenes) - (number of transitions * transitionLength)`.
 */
export const SHOWCASE_SECONDS = {
  intro: 4,
  features: 5,
  outro: 4.5,
  transitionLength: 0.7,
} as const;

/** Tempo of public/audio/music-bed.mp3. Used to sync visuals to the beat. */
export const MUSIC_BPM = 120;
