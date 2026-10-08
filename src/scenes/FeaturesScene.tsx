import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Background } from "../components/Background";
import { FeatureCard } from "../components/FeatureCard";
import { THEME } from "../config/theme";

/** Three feature cards enter in a stagger beneath an animated heading. */
export const FeaturesScene: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: THEME.font.family }}>
      <Background glowA={THEME.colors.accent} glowB={THEME.colors.primary} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 90,
          padding: `${THEME.safeArea.y}px ${THEME.safeArea.x}px`,
        }}
      >
        <AnimatedText
          text="Everything is a component."
          delay={0.2 * fps}
          staggerFrames={4}
          style={{
            fontSize: THEME.font.title,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: THEME.colors.text,
          }}
        />
        <div style={{ display: "flex", gap: 56 }}>
          <FeatureCard
            title="Typography"
            body="Word and character reveals driven by springs."
            iconPath="M 15 20 L 85 20 M 50 20 L 50 85 M 32 85 L 68 85"
            accent={THEME.colors.primary}
            delay={0.6 * fps}
          />
          <FeatureCard
            title="Shapes"
            body="Vector shapes and self-drawing SVG paths."
            iconPath="M 50 10 L 90 85 L 10 85 Z M 50 45 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0"
            accent={THEME.colors.accent}
            delay={0.8 * fps}
          />
          <FeatureCard
            title="Transitions"
            body="Slides, wipes and fades between scenes."
            iconPath="M 10 35 L 80 35 M 62 17 L 80 35 L 62 53 M 90 70 L 20 70 M 38 52 L 20 70 L 38 88"
            accent={THEME.colors.secondary}
            delay={1.0 * fps}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
