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
  /**
   * Partial demyelination of one sleeve (0 → 1). The sleeve thins, frays and
   * sheds small fragments, but the axon underneath always stays continuous.
   */
  readonly damage?: { readonly index: number; readonly amount: number };
  /** Off-white signal pulses at positions 0 → 1 along the axon (cell body → terminals). */
  readonly pulses?: readonly number[];
};

const SEGMENTS = 5;

const axonY = (t: number, width: number, wave: number, phase: number) =>
  Math.sin(t * Math.PI * 2 + phase) * width * 0.018 * wave;

/** Sleeve centers/sizes relative to the nerve's (x, y), e.g. to morph sleeves into other shapes. */
export const sleeveGeometry = (width: number, wave = 1, phase = 0) => {
  const half = width / 2;
  const h = 46 * Math.min(1, width / 700);
  const w = (width * 0.72) / SEGMENTS - 14;
  return Array.from({ length: SEGMENTS }, (_, i) => {
    const t = 0.2 + ((i + 0.5) / SEGMENTS) * 0.66;
    return { t, cx: half - t * width, cy: axonY(t, width, wave, phase), w, h };
  });
};

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
  damage,
  pulses = [],
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
        const dmg = damage && damage.index === i ? damage.amount : 0;
        if (dmg > 0) {
          // Frayed, thinner sleeve with a gap in its outline; fragments drift off.
          const dh = h * (1 - 0.42 * dmg);
          const dw = w * (1 - 0.18 * dmg);
          return (
            <g key={i} opacity={visible}>
              <rect
                x={cx - dw / 2}
                y={cy - dh / 2}
                width={dw}
                height={dh}
                rx={dh / 2}
                fill={BRAND.beige}
                opacity={1 - 0.45 * dmg}
              />
              <rect
                x={cx - dw / 2}
                y={cy - dh / 2}
                width={dw}
                height={dh}
                rx={dh / 2}
                fill="none"
                stroke={BRAND.charcoal}
                strokeWidth={4}
                strokeDasharray={`${10 - 4 * dmg} ${4 + 10 * dmg}`}
              />
              {[0, 1, 2].map((k) => (
                <circle
                  key={k}
                  cx={cx - dw / 3 + k * (dw / 3)}
                  cy={cy - dh / 2 - 8 - 26 * dmg * (0.6 + 0.4 * ((k + 1) % 2))}
                  r={5 - k}
                  fill={BRAND.beige}
                  stroke={BRAND.charcoal}
                  strokeWidth={2.5}
                  opacity={dmg}
                />
              ))}
            </g>
          );
        }
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
      {/* Signal pulses travelling along the (always continuous) axon. */}
      {pulses.map((p, i) =>
        p > 0 && p < 1 ? (
          <g
            key={i}
            transform={`translate(${half - p * width} ${axonY(p, width, wave, phase)})`}
          >
            <circle r={16} fill={BRAND.offWhite} opacity={0.35} />
            <circle
              r={8}
              fill={BRAND.offWhite}
              stroke={BRAND.charcoal}
              strokeWidth={2}
            />
          </g>
        ) : null,
      )}
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
