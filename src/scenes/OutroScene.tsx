import { evolvePath } from "@remotion/paths";
import { makeCircle } from "@remotion/shapes";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Background } from "../components/Background";
import { THEME } from "../config/theme";
import { MUSIC_BPM } from "../config/video";
import { CLAMP, EASE, SPRINGS, progress, springIn } from "../lib/animation";
import { beatPulse } from "../lib/audio";

const RING = makeCircle({ radius: 150 });

/** Logo mark draws itself, pulses on the beat, then the call to action lands. */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const ring = evolvePath(
    progress(frame, 0.1 * fps, 1.1 * fps, EASE.inOut),
    RING.path,
  );
  const play = springIn({
    frame,
    fps,
    delay: 0.7 * fps,
    config: SPRINGS.bouncy,
  });
  const pill = springIn({
    frame,
    fps,
    delay: 1.9 * fps,
    config: SPRINGS.snappy,
  });
  const pulse = beatPulse({ frame, fps, bpm: MUSIC_BPM });
  // Everything settles back into darkness at the very end.
  const exit = interpolate(
    frame,
    [durationInFrames - 0.6 * fps, durationInFrames - 1],
    [1, 0],
    {
      ...CLAMP,
      easing: EASE.inOut,
    },
  );

  return (
    <AbsoluteFill style={{ fontFamily: THEME.font.family }}>
      <Background
        glowA={THEME.colors.secondary}
        glowB={THEME.colors.highlight}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 56,
          opacity: exit,
          padding: `${THEME.safeArea.y}px ${THEME.safeArea.x}px`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 300,
            height: 300,
            scale: String(1 + pulse * 0.03),
          }}
        >
          <svg
            width={300}
            height={300}
            viewBox={`0 0 ${RING.width} ${RING.height}`}
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="outro-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={THEME.colors.primary} />
                <stop offset="100%" stopColor={THEME.colors.secondary} />
              </linearGradient>
            </defs>
            <path
              d={RING.path}
              fill="none"
              stroke="url(#outro-ring)"
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={ring.strokeDasharray}
              strokeDashoffset={ring.strokeDashoffset}
            />
          </svg>
          {/* Play triangle */}
          <svg
            width={300}
            height={300}
            viewBox="0 0 300 300"
            style={{
              position: "absolute",
              inset: 0,
              scale: String(play),
              rotate: `${interpolate(play, [0, 1], [-90, 0])}deg`,
            }}
          >
            <path
              d="M 122 95 L 212 150 L 122 205 Z"
              fill={THEME.colors.text}
              strokeLinejoin="round"
              stroke={THEME.colors.text}
              strokeWidth={18}
            />
          </svg>
        </div>
        <AnimatedText
          text="Ready to render."
          delay={1.0 * fps}
          staggerFrames={5}
          style={{
            fontSize: THEME.font.headline,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: THEME.colors.text,
          }}
        />
        <div
          style={{
            padding: "22px 44px",
            borderRadius: 999,
            fontSize: THEME.font.body,
            fontWeight: 700,
            color: THEME.colors.background,
            backgroundColor: THEME.colors.highlight,
            boxShadow: `0 0 ${40 + pulse * 30}px ${THEME.colors.highlight}66`,
            opacity: interpolate(pill, [0, 0.4], [0, 1], CLAMP),
            scale: String(interpolate(pill, [0, 1], [0.6, 1])),
          }}
        >
          npm run render
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
