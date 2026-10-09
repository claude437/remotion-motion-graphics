import React from "react";
import { AbsoluteFill } from "remotion";

type FilmGrainProps = {
  readonly frame: number;
  readonly width: number;
  readonly height: number;
  /** Overall strength (0–1). Keep it very light. */
  readonly intensity?: number;
  /** false = static grain (fixed seed), for a calmer look. */
  readonly animated?: boolean;
};

/**
 * Very light animated film grain plus a static paper texture. The noise seed
 * is derived from the frame number, so every render is identical.
 */
export const FilmGrain: React.FC<FilmGrainProps> = ({
  frame,
  width,
  height,
  intensity = 1,
  animated = true,
}) => {
  // Change grain every 2 frames (30 updates/s at 60 fps) for a filmic cadence.
  const seed = animated ? Math.floor(frame / 2) % 24 : 5;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          mixBlendMode: "soft-light",
          opacity: 0.55 * intensity,
        }}
      >
        <filter id="paper">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.02"
            numOctaves={3}
            seed={3}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width={width}
          height={height}
          filter="url(#paper)"
          opacity={0.35}
        />
      </svg>
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          mixBlendMode: "overlay",
          opacity: 0.16 * intensity,
        }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={width} height={height} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
