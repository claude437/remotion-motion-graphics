import { Audio } from "@remotion/media";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fadeVolume } from "../lib/audio";
import { getShowcaseTimeline } from "../lib/timeline";
import { FeaturesScene } from "../scenes/FeaturesScene";
import { IntroScene } from "../scenes/IntroScene";
import { OutroScene } from "../scenes/OutroScene";

/**
 * The sample video: three scenes joined by spring-timed transitions, with a
 * music bed and a whoosh sound effect landing exactly on each transition.
 * Scene lengths live in src/config/video.ts.
 */
export const Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeline = getShowcaseTimeline(fps);
  const transitionTiming = springTiming({
    config: { damping: 200 },
    durationInFrames: timeline.transitionLength,
  });

  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence
          name="Intro"
          durationInFrames={timeline.intro}
          premountFor={fps}
        >
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={transitionTiming}
        />
        <TransitionSeries.Sequence
          name="Features"
          durationInFrames={timeline.features}
          premountFor={fps}
        >
          <FeaturesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={transitionTiming}
        />
        <TransitionSeries.Sequence
          name="Outro"
          durationInFrames={timeline.outro}
          premountFor={fps}
        >
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio
        name="Music bed"
        src={staticFile("audio/music-bed.mp3")}
        volume={fadeVolume({
          frame,
          durationInFrames,
          fadeIn: Math.round(0.5 * fps),
          fadeOut: Math.round(1 * fps),
          volume: 0.8,
        })}
      />
      <Audio
        name="Whoosh 1"
        src={staticFile("audio/whoosh.mp3")}
        from={timeline.transitionStarts[0] - Math.round(0.25 * fps)}
        premountFor={fps}
        volume={0.9}
      />
      <Audio
        name="Whoosh 2"
        src={staticFile("audio/whoosh.mp3")}
        from={timeline.transitionStarts[1] - Math.round(0.25 * fps)}
        premountFor={fps}
        volume={0.9}
      />
    </AbsoluteFill>
  );
};
