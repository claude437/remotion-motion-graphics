import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { BRAND } from "../theme";

type ResearchCardProps = {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  /** 0 → 1 entrance (spring); values above 1 overshoot slightly. */
  readonly progress: number;
  readonly opacity?: number;
  /** Number of participant dots: deliberately few, to read as a SMALL study. */
  readonly sample: number;
};

const W = 200;
const H = 150;

/** Small research-paper card: header bar, text lines, a tiny sample of participant dots. */
export const ResearchCard: React.FC<ResearchCardProps> = ({
  x,
  y,
  rotation,
  progress,
  opacity = 1,
  sample,
}) => {
  if (progress <= 0 || opacity <= 0) return null;
  const rise = interpolate(progress, [0, 1], [60, 0]);
  return (
    <g
      transform={`translate(${x} ${y + rise}) rotate(${rotation}) scale(${0.7 + 0.3 * progress})`}
      opacity={interpolate(progress, [0, 0.4], [0, 1], CLAMP) * opacity}
    >
      <rect
        x={-W / 2 + 6}
        y={-H / 2 + 10}
        width={W}
        height={H}
        rx={18}
        fill={BRAND.orangeShadow}
        opacity={0.35}
      />
      <rect
        x={-W / 2}
        y={-H / 2}
        width={W}
        height={H}
        rx={18}
        fill={BRAND.offWhite}
      />
      <rect
        x={-W / 2}
        y={-H / 2}
        width={W}
        height={26}
        rx={13}
        fill={BRAND.charcoal}
      />
      <rect
        x={-W / 2}
        y={-H / 2 + 13}
        width={W}
        height={13}
        fill={BRAND.charcoal}
      />
      {/* Title + abstract lines (RTL: aligned right). */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={W / 2 - 22 - [130, 150, 100][i]}
          y={-H / 2 + 42 + i * 18}
          width={[130, 150, 100][i]}
          height={8}
          rx={4}
          fill={BRAND.gray}
        />
      ))}
      {/* Few participants. */}
      {Array.from({ length: sample }, (_, i) => (
        <circle
          key={i}
          cx={W / 2 - 30 - i * 22}
          cy={H / 2 - 26}
          r={7}
          fill={i === 0 ? BRAND.orange : BRAND.charcoal}
        />
      ))}
    </g>
  );
};
