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

      {/* new-compositions-go-above-this-line */}
    </>
  );
};
