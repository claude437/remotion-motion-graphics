import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../config/theme";

type BackgroundProps = {
  /** Color of the large glow in the top-left area. */
  readonly glowA?: string;
  /** Color of the large glow in the bottom-right area. */
  readonly glowB?: string;
  /** Show the subtle grid overlay. */
  readonly grid?: boolean;
};

/**
 * Dark backdrop with two slowly drifting color glows and an optional grid.
 * Motion is a pure function of the frame so it loops seamlessly between scenes.
 */
export const Background: React.FC<BackgroundProps> = ({
  glowA = THEME.colors.primary,
  glowB = THEME.colors.secondary,
  grid = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const ax = 25 + Math.sin(t * 0.6) * 8;
  const ay = 30 + Math.cos(t * 0.5) * 8;
  const bx = 75 + Math.cos(t * 0.45) * 8;
  const by = 70 + Math.sin(t * 0.55) * 8;
  const gridShift = interpolate(frame, [0, 10 * fps], [0, 80]);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.background }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${ax}% ${ay}%, ${glowA}55 0%, transparent 45%), radial-gradient(circle at ${bx}% ${by}%, ${glowB}40 0%, transparent 45%)`,
        }}
      />
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${THEME.colors.text}0D 1px, transparent 1px), linear-gradient(90deg, ${THEME.colors.text}0D 1px, transparent 1px)`,
            backgroundSize: `${width / 24}px ${width / 24}px`,
            backgroundPosition: `${gridShift}px ${gridShift}px`,
            maskImage: `radial-gradient(ellipse ${width * 0.6}px ${height * 0.6}px at 50% 50%, black 30%, transparent 100%)`,
          }}
        />
      ) : null}
      {/* Vignette keeps the eye centered and hides edges of the glows. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
