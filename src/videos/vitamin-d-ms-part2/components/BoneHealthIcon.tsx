import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { BRAND } from "../../vitamin-d-ms/theme";

type BoneHealthIconProps = {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  /** 0 → 1: outline draws, then fill and inner structure appear. */
  readonly draw: number;
  /** 0 → 1: dashed "strength" ring around the bone. */
  readonly ring?: number;
  /** Ring rotation in degrees (slow idle spin). */
  readonly spin?: number;
  readonly opacity?: number;
  readonly rotation?: number;
};

// Classic bone silhouette in a 470×200 box centered on (0, 0).
const BONE =
  "M -130 -32 L 130 -32 C 140 -70 190 -95 215 -62 C 235 -40 225 -10 205 0 C 225 10 235 40 215 62 C 190 95 140 70 130 32 L -130 32 C -140 70 -190 95 -215 62 C -235 40 -225 10 -205 0 C -225 -10 -235 -40 -215 -62 C -190 -95 -140 -70 -130 -32 Z";
// Trabecular (inner structure) hints.
const TRABECULAE = [
  "M -110 -12 C -40 -18 40 -6 110 -12",
  "M -110 12 C -40 6 40 18 110 12",
  "M 168 -40 C 186 -30 192 -12 184 0",
  "M -168 40 C -186 30 -192 12 -184 0",
];

/** Clean bone icon in the series' charcoal/beige style, with a soft support ring. */
export const BoneHealthIcon: React.FC<BoneHealthIconProps> = ({
  x,
  y,
  scale,
  draw,
  ring = 0,
  spin = 0,
  opacity = 1,
  rotation = -24,
}) => {
  if (opacity <= 0 || scale <= 0) return null;
  const outline = evolvePath(interpolate(draw, [0, 0.7], [0, 1], CLAMP), BONE);
  const fill = interpolate(draw, [0.45, 0.9], [0, 1], CLAMP);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      {ring > 0 ? (
        <circle
          r={265}
          fill="none"
          stroke={BRAND.offWhite}
          strokeWidth={5}
          strokeDasharray="4 18"
          strokeLinecap="round"
          transform={`rotate(${spin})`}
          opacity={0.75 * ring}
          strokeDashoffset={0}
        />
      ) : null}
      <g transform={`rotate(${rotation})`}>
        <path d={BONE} fill={BRAND.offWhite} opacity={fill} />
        {TRABECULAE.map((d, i) => {
          const p = evolvePath(
            interpolate(draw, [0.6 + i * 0.05, 0.95 + i * 0.01], [0, 1], CLAMP),
            d,
          );
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={BRAND.beige}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={p.strokeDasharray}
              strokeDashoffset={p.strokeDashoffset}
            />
          );
        })}
        <path
          d={BONE}
          fill="none"
          stroke={BRAND.charcoal}
          strokeWidth={9}
          strokeLinejoin="round"
          strokeDasharray={outline.strokeDasharray}
          strokeDashoffset={outline.strokeDashoffset}
        />
      </g>
    </g>
  );
};
