import React from "react";
import { Composition, Folder } from "remotion";
import { Showcase } from "./compositions/Showcase";
import { SHOWCASE_SECONDS, VIDEO } from "./config/video";
import { sec } from "./lib/animation";
import { getShowcaseTimeline } from "./lib/timeline";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";
import { FORMAT } from "./videos/vitamin-d-ms/timeline";
import { VitaminDMS } from "./videos/vitamin-d-ms/VitaminDMS";
import { FORMAT as PART2_FORMAT } from "./videos/vitamin-d-ms-part2/timeline";
import { VitaminDMSPart2 } from "./videos/vitamin-d-ms-part2/VitaminDMSPart2";
import { FORMAT as TAYIBAT_FORMAT } from "./videos/tayibat-ms/timeline";
import { TayibatMS } from "./videos/tayibat-ms/TayibatMS";

/**
 * Every renderable video is registered here. Width, height and fps come from
 * src/config/video.ts so they can be changed in one place.
 *
 * `npm run new -- <Name>` scaffolds a composition and registers it above the
 * marker comment at the end of this file.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Showcase"
        component={Showcase}
        width={VIDEO.width}
        height={VIDEO.height}
        fps={VIDEO.fps}
        durationInFrames={getShowcaseTimeline(VIDEO.fps).total}
      />

      {/* Each scene can also be previewed and rendered on its own. */}
      <Folder name="Showcase-Scenes">
        <Composition
          id="Intro"
          component={IntroScene}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(SHOWCASE_SECONDS.intro, VIDEO.fps)}
        />
        <Composition
          id="Features"
          component={FeaturesScene}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(SHOWCASE_SECONDS.features, VIDEO.fps)}
        />
        <Composition
          id="Outro"
          component={OutroScene}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(SHOWCASE_SECONDS.outro, VIDEO.fps)}
        />
      </Folder>

      {/* Vertical 9:16 TikTok explainer. Format + timing: src/videos/vitamin-d-ms/timeline.ts */}
      <Composition
        id="VitaminDMS"
        component={VitaminDMS}
        width={FORMAT.width}
        height={FORMAT.height}
        fps={FORMAT.fps}
        durationInFrames={FORMAT.seconds * FORMAT.fps}
      />

      {/* Part 2 of the series (continues from VitaminDMS's final frame). Timing: src/videos/vitamin-d-ms-part2/timeline.ts */}
      <Composition
        id="VitaminDMS-Part2"
        component={VitaminDMSPart2}
        width={PART2_FORMAT.width}
        height={PART2_FORMAT.height}
        fps={PART2_FORMAT.fps}
        durationInFrames={PART2_FORMAT.seconds * PART2_FORMAT.fps}
      />

      {/* Tayibat diet vs evidence-based MS care (15 × 2 s scenes). Timing + SFX cues: src/videos/tayibat-ms/timeline.ts */}
      <Composition
        id="TayibatMS"
        component={TayibatMS}
        width={TAYIBAT_FORMAT.width}
        height={TAYIBAT_FORMAT.height}
        fps={TAYIBAT_FORMAT.fps}
        durationInFrames={TAYIBAT_FORMAT.seconds * TAYIBAT_FORMAT.fps}
      />

      {/* new-compositions-go-above-this-line */}
    </>
  );
};
