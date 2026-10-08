import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { ARABIC_FONT, BRAND } from "../../vitamin-d-ms/theme";

type VialProps = {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  /** 0 → 1 sample level. */
  readonly fill: number;
  readonly id: string;
};

/**
 * Test tube with a sample. The sample uses the brand's deep orange instead of
 * red to stay inside the MS Fighter palette.
 */
export const Vial: React.FC<VialProps> = ({ x, y, scale, fill, id }) => {
  const level = interpolate(fill, [0, 1], [110, -55], CLAMP);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <clipPath id={`${id}-tube`}>
          <path d="M -34 -100 L 34 -100 L 34 82 A 34 34 0 0 1 -34 82 Z" />
        </clipPath>
      </defs>
      <path
        d="M -34 -100 L 34 -100 L 34 82 A 34 34 0 0 1 -34 82 Z"
        fill={BRAND.offWhite}
      />
      <g clipPath={`url(#${id}-tube)`}>
        <rect
          x={-40}
          y={level}
          width={80}
          height={240}
          fill={BRAND.orangeShadow}
        />
        <rect
          x={-40}
          y={level}
          width={80}
          height={10}
          fill={BRAND.orangeBright}
          opacity={0.7}
        />
      </g>
      <rect
        x={-20}
        y={-60}
        width={40}
        height={60}
        rx={6}
        fill={BRAND.beige}
        opacity={0.9}
      />
      <rect
        x={-12}
        y={-46}
        width={24}
        height={5}
        rx={2.5}
        fill={BRAND.charcoal}
        opacity={0.5}
      />
      <rect
        x={-12}
        y={-34}
        width={16}
        height={5}
        rx={2.5}
        fill={BRAND.charcoal}
        opacity={0.5}
      />
      <path
        d="M -34 -100 L 34 -100 L 34 82 A 34 34 0 0 1 -34 82 Z"
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <rect
        x={-46}
        y={-132}
        width={92}
        height={36}
        rx={10}
        fill={BRAND.charcoal}
      />
    </g>
  );
};

type BloodTestPanelProps = {
  /** Card center (the card surface itself is the persistent morphing panel). */
  readonly x: number;
  readonly y: number;
  readonly opacity: number;
  readonly fill: number;
  /** 0 → 1 spring for the "step 1" badge. */
  readonly badge: number;
  /** Seconds, drives the pending-result dots on the result track. */
  readonly sec: number;
  readonly trackY: number;
};

/** Lab report: "25-OH Vitamin D" title, sample vial, report lines, step badge, pending result. */
export const BloodTestPanel: React.FC<BloodTestPanelProps> = ({
  x,
  y,
  opacity,
  fill,
  badge,
  sec,
  trackY,
}) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      <text
        x={x + 20}
        y={y - 200}
        textAnchor="middle"
        direction="ltr"
        fontFamily={ARABIC_FONT}
        fontWeight={700}
        fontSize={58}
        fill={BRAND.charcoal}
      >
        25-OH Vitamin D
      </text>
      <line
        x1={x - 320}
        x2={x + 320}
        y1={y - 160}
        y2={y - 160}
        stroke={BRAND.gray}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Report lines, right-aligned (RTL card). */}
      {[300, 250, 330, 200].map((w, i) => (
        <rect
          key={i}
          x={x + 100 - w}
          y={y - 95 + i * 46}
          width={w}
          height={14}
          rx={7}
          fill={BRAND.gray}
        />
      ))}
      <rect
        x={x - 300}
        y={y - 95}
        width={70}
        height={14}
        rx={7}
        fill={BRAND.beige}
      />
      <Vial x={x + 230} y={y + 5} scale={1} fill={fill} id="part2-vial" />
      {/* Pending result dots on the track */}
      {[0, 1, 2].map((i) => {
        const a = 0.35 + 0.65 * Math.max(0, Math.sin(sec * 6 - i * 0.9));
        return (
          <circle
            key={i}
            cx={x - 30 + i * 30}
            cy={trackY - 36}
            r={8}
            fill={BRAND.charcoal}
            opacity={a * 0.6}
          />
        );
      })}
      {/* Step badge */}
      {badge > 0 ? (
        <g transform={`translate(${x + 340} ${y - 285}) scale(${badge})`}>
          <circle r={42} fill={BRAND.orange} />
          <text
            y={16}
            textAnchor="middle"
            fontFamily={ARABIC_FONT}
            fontWeight={700}
            fontSize={46}
            fill={BRAND.offWhite}
          >
            1
          </text>
        </g>
      ) : null}
    </g>
  );
};
