import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../config/theme";
import { CLAMP, SPRINGS, springIn } from "../lib/animation";
import { DrawPath } from "./DrawPath";

type FeatureCardProps = {
  readonly title: string;
  readonly body: string;
  /** Icon outline, drawn in a 100×100 viewBox. */
  readonly iconPath: string;
  readonly accent: string;
  /** Frame (relative to the parent sequence) when the card enters. */
  readonly delay?: number;
};

/** Glassy card that rises in, then draws its icon and reveals its copy. */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  body,
  iconPath,
  accent,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = springIn({ frame, fps, delay, config: SPRINGS.snappy });
  const copy = springIn({ frame, fps, delay: delay + 0.35 * fps });

  return (
    <div
      style={{
        width: 500,
        padding: "56px 48px",
        borderRadius: THEME.radius,
        background: `linear-gradient(160deg, ${THEME.colors.backgroundAlt}EE, ${THEME.colors.background}CC)`,
        border: `2px solid ${accent}55`,
        boxShadow: `0 40px 80px rgba(0,0,0,0.45), inset 0 1px 0 ${THEME.colors.text}1A`,
        display: "flex",
        flexDirection: "column",
        gap: 28,
        opacity: interpolate(enter, [0, 0.5], [0, 1], CLAMP),
        translate: `0 ${interpolate(enter, [0, 1], [160, 0])}px`,
        scale: String(interpolate(enter, [0, 1], [0.9, 1])),
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 28,
          backgroundColor: `${accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DrawPath
          d={iconPath}
          viewBox="0 0 100 100"
          size={72}
          color={accent}
          strokeWidth={7}
          delay={delay + 0.2 * fps}
          duration={Math.round(0.9 * fps)}
        />
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: THEME.colors.text,
          letterSpacing: "-0.02em",
          opacity: copy,
          translate: `0 ${interpolate(copy, [0, 1], [24, 0])}px`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: THEME.font.caption + 4,
          lineHeight: 1.4,
          fontWeight: 500,
          color: THEME.colors.textMuted,
          opacity: copy,
          translate: `0 ${interpolate(copy, [0, 1], [24, 0])}px`,
        }}
      >
        {body}
      </div>
    </div>
  );
};
