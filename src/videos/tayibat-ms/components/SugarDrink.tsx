import React from "react";
import { BRAND } from "../theme";

/** Isometric sugar cube, centered on (x, y). Its top dots become "particles" later. */
export const SugarCube: React.FC<{
  x: number;
  y: number;
  s: number;
  opacity?: number;
  rotation?: number;
}> = ({ x, y, s, opacity = 1, rotation = 0 }) => {
  if (opacity <= 0 || s <= 0.5) return null;
  const h = s * 0.5;
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotation})`}
      opacity={opacity}
      strokeLinejoin="round"
    >
      <path
        d={`M 0 ${-h} L ${s / 2} ${-h / 2} L 0 0 L ${-s / 2} ${-h / 2} Z`}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={4}
      />
      <path
        d={`M ${-s / 2} ${-h / 2} L 0 0 L 0 ${h} L ${-s / 2} ${h / 2} Z`}
        fill={BRAND.gray}
        stroke={BRAND.charcoal}
        strokeWidth={4}
      />
      <path
        d={`M ${s / 2} ${-h / 2} L 0 0 L 0 ${h} L ${s / 2} ${h / 2} Z`}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={4}
      />
      {[
        [-s * 0.12, -h * 0.55],
        [s * 0.1, -h * 0.5],
        [0, -h * 0.3],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={s * 0.045} fill={BRAND.gray} />
      ))}
    </g>
  );
};

export const Spoon: React.FC<{
  x: number;
  y: number;
  opacity?: number;
  rotation?: number;
}> = ({ x, y, opacity = 1, rotation = -18 }) => {
  if (opacity <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`} opacity={opacity}>
      <rect
        x={-12}
        y={20}
        width={24}
        height={170}
        rx={12}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={6}
      />
      <ellipse
        cx={0}
        cy={-30}
        rx={58}
        ry={66}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={7}
      />
      <ellipse
        cx={0}
        cy={-26}
        rx={40}
        ry={46}
        fill={BRAND.gray}
        opacity={0.6}
      />
      <SugarCube x={0} y={-24} s={54} />
    </g>
  );
};

/** Generic sweetened drink: lidded cup + straw, no brand. Liquid in accent orange. */
export const SweetDrink: React.FC<{
  x: number;
  y: number;
  opacity?: number;
  scale?: number;
  sec: number;
}> = ({ x, y, opacity = 1, scale = 1, sec }) => {
  if (opacity <= 0) return null;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      opacity={opacity}
      strokeLinejoin="round"
    >
      <path
        d="M 20 -140 L 46 -230 L 92 -238"
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d="M -86 -120 L 86 -120 L 64 150 Q 62 170 42 170 L -42 170 Q -62 170 -64 150 Z"
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={7}
      />
      <path
        d="M -80 -60 L 80 -60 L 66 140 Q 64 158 46 158 L -46 158 Q -64 158 -66 140 Z"
        fill={BRAND.orangeBright}
        opacity={0.9}
      />
      {[0, 1, 2, 3].map((i) => {
        const yy = 130 - ((sec * 70 + i * 47) % 180);
        return (
          <circle
            key={i}
            cx={-40 + i * 26}
            cy={yy}
            r={6}
            fill={BRAND.offWhite}
            opacity={0.7}
          />
        );
      })}
      <rect
        x={-100}
        y={-142}
        width={200}
        height={34}
        rx={14}
        fill={BRAND.charcoal}
      />
      <rect
        x={-56}
        y={10}
        width={112}
        height={64}
        rx={14}
        fill={BRAND.offWhite}
        stroke={BRAND.charcoal}
        strokeWidth={5}
      />
      <SugarCube x={0} y={44} s={38} />
    </g>
  );
};
