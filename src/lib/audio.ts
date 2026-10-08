import { interpolate } from "remotion";
import { CLAMP } from "./animation";

/** Number of frames per beat at a given tempo. */
export const framesPerBeat = (fps: number, bpm: number) => (60 / bpm) * fps;

/** Frame on which the n-th beat (0-based) lands. */
export const beatFrame = (beat: number, fps: number, bpm: number) =>
  Math.round(beat * framesPerBeat(fps, bpm));

/**
 * 1 on each beat, decaying to 0 before the next one. Multiply a scale or glow
 * by this to make visuals pulse in time with the music.
 */
export const beatPulse = ({
  frame,
  fps,
  bpm,
  decay = 0.6,
}: {
  frame: number;
  fps: number;
  bpm: number;
  /** Fraction of the beat over which the pulse fades out (0–1). */
  decay?: number;
}) => {
  const perBeat = framesPerBeat(fps, bpm);
  const phase = (frame % perBeat) / perBeat;
  return interpolate(phase, [0, decay], [1, 0], CLAMP);
};

/** Volume curve that fades in over `fadeIn` frames and out over the last `fadeOut` frames. */
export const fadeVolume = ({
  frame,
  durationInFrames,
  fadeIn,
  fadeOut,
  volume = 1,
}: {
  frame: number;
  durationInFrames: number;
  fadeIn: number;
  fadeOut: number;
  volume?: number;
}) =>
  interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, volume, volume, 0],
    CLAMP,
  );
