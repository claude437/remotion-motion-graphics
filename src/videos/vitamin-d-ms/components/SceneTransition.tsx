import React from "react";
import { interpolate } from "remotion";
import { CLAMP, EASE } from "../../../lib/animation";
import { BRAND } from "../theme";

type SceneTransitionProps = {
  readonly frame: number;
  readonly fps: number;
  /** Seconds at which the scene change happens. */
  readonly at: number;
  /** Focal point the ripple expands from (where the morph happens). */
  readonly x: number;
  readonly y: number;
};

const DURATION = 0.8;

/**
 * Soft double ripple that radiates from the morph point when one scene flows
 * into the next. It marks the beat of the change without ever cutting.
 */
export const SceneTransition: React.FC<SceneTransitionProps> = ({
  frame,
  fps,
  at,
  x,
  y,
}) => {
  const t = (frame - at * fps) / (DURATION * fps);
  if (t < 0 || t > 1.3) return null;
  return (
    <g>
      {[0, 0.18].map((offset) => {
        const p = interpolate(t, [offset, 1 + offset], [0, 1], {
          ...CLAMP,
          easing: EASE.out,
        });
        if (p <= 0 || p >= 1) return null;
        return (
          <circle
            key={offset}
            cx={x}
            cy={y}
            r={60 + 560 * p}
            fill="none"
            stroke={BRAND.offWhite}
            strokeWidth={4 * (1 - p) + 1}
            opacity={0.32 * (1 - p)}
          />
        );
      })}
    </g>
  );
};
