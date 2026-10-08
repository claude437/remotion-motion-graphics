import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { BRAND } from "../theme";

type NerveMyelinProps = {
  /** Horizontal center of the axon. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** 0 → 1: how much of the axon line is drawn (right to left, RTL reading). */
  readonly draw: number;
  /** 0 → 1: myelin sheath, cell body and terminals. At 0 only a straight line remains. */
  readonly myelin: number;
  /** 0 → 1: gentle wave of the axon. 0 makes it a perfectly straight line (graph axis). */
  readonly wave?: number;
  readonly opacity?: number;
  /** Idle phase so the sheath breathes subtly. */
  readonly phase?: number;
};

const SEGMENTS = 5;

const axonY = (t: number, width: number, wave: number, phase: number) =>
  Math.sin(t * Math.PI * 2 + phase) * width * 0.018 * wave;

/**
 * Minimal neuron: cell body with dendrites on the right, a myelinated axon
 * running left, and branching terminals. Drawn in charcoal with beige sheath.
 */
export const NerveMyelin: React.FC<NerveMyelinProps> = ({
  x,
  y,
  width,
  draw,
  myelin,
  wave = 1,
  opacity = 1,
  phase = 0,
}) => {
  if (opacity <= 0 || width <= 1) return null;
  const half = width / 2;
  const steps = 48;
  // Path runs from the right end (cell body) to the left end (terminals).
  const d = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const px = half - t * width;
    const py = axonY(t, width, wave, phase);
    return `${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
  }).join(" ");
  const axon = evolvePath(draw, d);
  const sheathH = 46 * Math.min(1, width / 700);
  const segW = (width * 0.72) / SEGMENTS - 14;

  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <path
        d={d}
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={axon.strokeDasharray}
        strokeDashoffset={axon.strokeDashoffset}
      />
      {/* Myelin sheath segments, separated by nodes of Ranvier. */}
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const t = 0.2 + ((i + 0.5) / SEGMENTS) * 0.66;
        const local = interpolate(
          myelin,
          [i * 0.12, i * 0.12 + 0.4],
          [0, 1],
          CLAMP,
        );
        const visible = Math.min(
          local,
          interpolate(draw, [t - 0.05, t + 0.05], [0, 1], CLAMP),
        );
        if (visible <= 0) return null;
        const cx = half - t * width;
        const cy = axonY(t, width, wave, phase);
        const w = segW * visible;
        const h = sheathH * (0.4 + 0.6 * visible);
        return (
          <rect
            key={i}
            x={cx - w / 2}
            y={cy - h / 2}
            width={w}
            height={h}
            rx={h / 2}
            fill={BRAND.beige}
            stroke={BRAND.charcoal}
            strokeWidth={4}
            opacity={visible}
          />
        );
      })}
      {/* Cell body with dendrites (right end). */}
      <g
        transform={`translate(${half + 34} 0) scale(${myelin})`}
        opacity={interpolate(myelin, [0, 0.4], [0, 1], CLAMP)}
      >
        {[-55, -20, 20, 55, 160].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return (
            <path
              key={deg}
              d={`M ${Math.cos(a) * 30} ${Math.sin(a) * 30} Q ${Math.cos(a) * 52} ${
                Math.sin(a) * 52 + 8
              } ${Math.cos(a) * 70} ${Math.sin(a) * 66}`}
              fill="none"
              stroke={BRAND.charcoal}
              strokeWidth={6}
              strokeLinecap="round"
            />
          );
        })}
        <circle
          r={36}
          fill={BRAND.offWhite}
          stroke={BRAND.charcoal}
          strokeWidth={6}
        />
        <circle r={13} fill={BRAND.orange} />
      </g>
      {/* Axon terminals (left end). */}
      <g
        transform={`translate(${-half} ${axonY(1, width, wave, phase)})`}
        opacity={interpolate(myelin, [0.5, 1], [0, 1], CLAMP)}
      >
        {[-34, 0, 34].map((dy) => (
          <g key={dy}>
            <path
              d={`M 0 0 Q -18 ${dy * 0.3} -34 ${dy}`}
              fill="none"
              stroke={BRAND.charcoal}
              strokeWidth={5}
              strokeLinecap="round"
            />
            <circle cx={-38} cy={dy} r={8} fill={BRAND.charcoal} />
          </g>
        ))}
      </g>
    </g>
  );
};
