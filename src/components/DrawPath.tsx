import { evolvePath } from "@remotion/paths";
import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, progress } from "../lib/animation";

type DrawPathProps = {
  /** SVG path data in the coordinate space of `viewBox`. */
  readonly d: string;
  readonly viewBox: string;
  readonly size: number;
  readonly color: string;
  readonly strokeWidth?: number;
  /** Frame (relative to the parent sequence) when drawing starts. */
  readonly delay?: number;
  /** Number of frames the stroke takes to draw. */
  readonly duration?: number;
  readonly style?: React.CSSProperties;
};

/** Draws an SVG stroke from start to end, like a pen sketching the shape. */
export const DrawPath: React.FC<DrawPathProps> = ({
  d,
  viewBox,
  size,
  color,
  strokeWidth = 6,
  delay = 0,
  duration = 30,
  style,
}) => {
  const frame = useCurrentFrame();
  const { strokeDasharray, strokeDashoffset } = evolvePath(
    progress(frame, delay, duration, EASE.inOut),
    d,
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      style={{ overflow: "visible", ...style }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />
    </svg>
  );
};
