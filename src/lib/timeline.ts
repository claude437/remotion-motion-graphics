import { SHOWCASE_SECONDS } from "../config/video";
import { sec } from "./animation";

/**
 * Frame-accurate timeline for the Showcase video, derived from the seconds
 * in src/config/video.ts. Used both for the composition's total duration and
 * for placing audio cues exactly on the scene transitions.
 */
export const getShowcaseTimeline = (fps: number) => {
  const intro = sec(SHOWCASE_SECONDS.intro, fps);
  const features = sec(SHOWCASE_SECONDS.features, fps);
  const outro = sec(SHOWCASE_SECONDS.outro, fps);
  const transitionLength = sec(SHOWCASE_SECONDS.transitionLength, fps);

  // Each transition starts `transitionLength` frames before the previous scene ends.
  const firstTransitionStart = intro - transitionLength;
  const secondTransitionStart =
    firstTransitionStart + features - transitionLength;

  return {
    intro,
    features,
    outro,
    transitionLength,
    transitionStarts: [firstTransitionStart, secondTransitionStart],
    total: intro + features + outro - 2 * transitionLength,
  };
};
