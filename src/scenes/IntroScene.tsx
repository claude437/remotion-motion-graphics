import { Circle, Rect, Star, Triangle } from "@remotion/shapes";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Background } from "../components/Background";
import { DrawPath } from "../components/DrawPath";
import { PopIn } from "../components/PopIn";
import { THEME } from "../config/theme";
import { MUSIC_BPM } from "../config/video";
import { CLAMP, EASE, progress } from "../lib/animation";
import { beatPulse } from "../lib/audio";

/** Opening title: shapes pop in on the beat while the headline rises word by word. */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = beatPulse({ frame, fps, bpm: MUSIC_BPM });
  const subtitle = progress(frame, 1.6 * fps, 0.8 * fps);

  return (
    <AbsoluteFill style={{ fontFamily: THEME.font.family }}>
      <Background />

      {/* Decorative shapes, entering one after another. */}
      <PopIn
        delay={0.1 * fps}
        float={14}
        pulse={pulse}
        style={{ left: 150, top: 120 }}
      >
        <Circle radius={70} fill={THEME.colors.primary} />
      </PopIn>
      <PopIn
        delay={0.25 * fps}
        float={18}
        fromRotation={90}
        style={{ right: 170, top: 130 }}
      >
        <Triangle
          length={170}
          direction="up"
          cornerRadius={18}
          fill={THEME.colors.accent}
        />
      </PopIn>
      <PopIn
        delay={0.4 * fps}
        float={12}
        fromRotation={-120}
        pulse={pulse}
        style={{ left: 130, bottom: 90 }}
      >
        <Star
          points={5}
          innerRadius={42}
          outerRadius={88}
          cornerRadius={8}
          fill={THEME.colors.highlight}
        />
      </PopIn>
      <PopIn
        delay={0.55 * fps}
        float={16}
        fromRotation={60}
        style={{ right: 150, bottom: 100 }}
      >
        <Rect
          width={140}
          height={140}
          cornerRadius={32}
          fill={THEME.colors.secondary}
        />
      </PopIn>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 28,
          padding: `${THEME.safeArea.y}px ${THEME.safeArea.x}px`,
          // Gentle push-in over the whole scene adds depth.
          scale: String(interpolate(frame, [0, 4 * fps], [1, 1.04], CLAMP)),
        }}
      >
        <AnimatedText
          text="REMOTION × AI AGENTS"
          by="char"
          variant="blur"
          delay={0.2 * fps}
          staggerFrames={1}
          style={{
            fontSize: THEME.font.caption,
            fontWeight: 700,
            letterSpacing: "0.3em",
            color: THEME.colors.secondary,
          }}
        />
        <AnimatedText
          text="Motion graphics,"
          delay={0.45 * fps}
          staggerFrames={5}
          style={{
            fontSize: THEME.font.headline,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: THEME.colors.text,
          }}
        />
        <div style={{ position: "relative" }}>
          <AnimatedText
            text="written in code."
            delay={0.7 * fps}
            staggerFrames={5}
            style={{
              fontSize: THEME.font.headline,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
            unitStyle={{
              backgroundImage: `linear-gradient(90deg, ${THEME.colors.primary}, ${THEME.colors.accent} 60%, ${THEME.colors.highlight})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          />
          <DrawPath
            d="M 10 40 C 220 10, 520 10, 990 30"
            viewBox="0 0 1000 50"
            size={1000}
            color={THEME.colors.accent}
            strokeWidth={8}
            delay={1.2 * fps}
            duration={Math.round(0.7 * fps)}
            style={{
              position: "absolute",
              left: "50%",
              bottom: -60,
              height: 50,
              translate: "-50% 0",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: THEME.font.body,
            fontWeight: 500,
            color: THEME.colors.textMuted,
            opacity: subtitle,
            translate: `0 ${interpolate(subtitle, [0, 1], [30, 0], { ...CLAMP, easing: EASE.out })}px`,
          }}
        >
          React components. Frame-perfect timing. Rendered to MP4.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
