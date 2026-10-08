import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { ARABIC_FONT, BRAND } from "../theme";

type MRIScanProps = {
  readonly x: number;
  readonly y: number;
  /** Panel size the HUD is drawn against. */
  readonly w: number;
  readonly h: number;
  /** 0 → 1 brain outline drawing. */
  readonly draw: number;
  /** 0 → 1 scan line sweep (top → bottom). Lesions appear as it passes. */
  readonly scan: number;
  /** 0 → 1 subtle improvement in a few indicators. Never makes lesions vanish. */
  readonly improve: number;
  readonly opacity: number;
};

// Axial brain slice in a 400×480 box centered on (0, 0).
const BRAIN =
  "M 0 -230 C 110 -232 190 -160 196 -40 C 202 80 160 200 60 228 C 30 236 -30 236 -60 228 C -160 200 -202 80 -196 -40 C -190 -160 -110 -232 0 -230 Z";
const FISSURE = "M 0 -230 C 6 -150 -6 -60 4 30 C 10 120 -4 180 0 228";
const VENTRICLE_R = "M 18 -70 C 60 -80 82 -40 70 10 C 62 40 40 60 22 50";
const VENTRICLE_L = "M -18 -70 C -60 -80 -82 -40 -70 10 C -62 40 -40 60 -22 50";
const GYRI = [
  "M 120 -150 C 150 -120 160 -80 150 -40",
  "M -120 -150 C -150 -120 -160 -80 -150 -40",
  "M 150 40 C 160 90 140 140 100 170",
  "M -150 40 C -160 90 -140 140 -100 170",
  "M 60 -190 C 90 -170 100 -150 96 -120",
  "M -60 -190 C -90 -170 -100 -150 -96 -120",
];
// Periventricular lesions. Two of them (improves) shrink slightly.
const LESIONS = [
  { x: 92, y: -54, r: 13, improves: true },
  { x: -96, y: -30, r: 11, improves: false },
  { x: 60, y: 76, r: 10, improves: false },
  { x: -70, y: 92, r: 14, improves: true },
  { x: 128, y: 34, r: 8, improves: false },
  { x: -40, y: -128, r: 9, improves: false },
];

/** Stylized MRI interface: axial brain slice, scan sweep, lesions and three indicator meters. */
export const MRIScan: React.FC<MRIScanProps> = ({
  x,
  y,
  w,
  h,
  draw,
  scan,
  improve,
  opacity,
}) => {
  if (opacity <= 0) return null;
  const outline = evolvePath(draw, BRAIN);
  const scanY = interpolate(scan, [0, 1], [-250, 250]);
  const stroke = BRAND.gray;
  const hx = w / 2 - 34;
  const hy = h / 2 - 34;
  const bracket = 40;

  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      {/* HUD corner brackets */}
      {[
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].map(([sx, sy]) => (
        <path
          key={`${sx}${sy}`}
          d={`M ${sx * hx} ${sy * (hy - bracket)} L ${sx * hx} ${sy * hy} L ${sx * (hx - bracket)} ${sy * hy}`}
          fill="none"
          stroke={stroke}
          strokeWidth={3}
          opacity={0.7 * draw}
        />
      ))}
      <text
        x={-hx + 6}
        y={-hy + 34}
        fontFamily={ARABIC_FONT}
        fontWeight={600}
        fontSize={26}
        fill={BRAND.offWhite}
        opacity={draw}
      >
        MRI
      </text>
      <text
        x={-hx + 6}
        y={-hy + 64}
        fontFamily={ARABIC_FONT}
        fontWeight={500}
        fontSize={20}
        fill={BRAND.gray}
        opacity={0.7 * draw}
      >
        AXIAL · T2
      </text>

      <g transform="translate(0 -10)">
        {/* Soft tissue fill */}
        <path d={BRAIN} fill={BRAND.offWhite} opacity={0.06 * draw} />
        <path
          d={BRAIN}
          fill="none"
          stroke={BRAND.offWhite}
          strokeWidth={5}
          strokeDasharray={outline.strokeDasharray}
          strokeDashoffset={outline.strokeDashoffset}
        />
        {[FISSURE, VENTRICLE_R, VENTRICLE_L, ...GYRI].map((d, i) => {
          const p = evolvePath(
            interpolate(draw, [0.3 + i * 0.04, 0.8 + i * 0.02], [0, 1], CLAMP),
            d,
          );
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth={i < 3 ? 4 : 3}
              strokeLinecap="round"
              opacity={i < 3 ? 0.9 : 0.55}
              strokeDasharray={p.strokeDasharray}
              strokeDashoffset={p.strokeDashoffset}
            />
          );
        })}
        {LESIONS.map((l, i) => {
          const seen = interpolate(scanY, [l.y - 30, l.y + 10], [0, 1], CLAMP);
          const shrink = l.improves
            ? interpolate(improve, [0, 1], [1, 0.78])
            : 1;
          const dim = l.improves ? interpolate(improve, [0, 1], [1, 0.75]) : 1;
          return (
            <g key={i} opacity={seen}>
              <circle
                cx={l.x}
                cy={l.y}
                r={l.r * shrink}
                fill={BRAND.beige}
                opacity={0.9 * dim}
              />
              {l.improves ? (
                <circle
                  cx={l.x}
                  cy={l.y}
                  r={l.r + 14}
                  fill="none"
                  stroke={BRAND.orangeBright}
                  strokeWidth={3}
                  opacity={interpolate(improve, [0, 0.3], [0, 1], CLAMP)}
                />
              ) : null}
            </g>
          );
        })}
        {/* Scan sweep */}
        <g opacity={interpolate(scan, [0, 0.08, 0.9, 1], [0, 1, 1, 0], CLAMP)}>
          <rect
            x={-210}
            y={scanY - 40}
            width={420}
            height={40}
            fill={BRAND.orangeBright}
            opacity={0.12}
          />
          <line
            x1={-210}
            x2={210}
            y1={scanY}
            y2={scanY}
            stroke={BRAND.orangeBright}
            strokeWidth={3}
          />
        </g>
      </g>

      {/* Indicator meters (bottom-right, RTL): two ease down slightly, one unchanged. */}
      {[0.62, 0.55, 0.7].map((base, i) => {
        const value = i < 2 ? base - 0.08 * improve : base;
        const mw = 150;
        const mx = hx - 10 - mw;
        const my = hy - 92 + i * 28;
        return (
          <g key={i} opacity={draw}>
            <rect
              x={mx}
              y={my}
              width={mw}
              height={10}
              rx={5}
              fill={BRAND.gray}
              opacity={0.25}
            />
            <rect
              x={mx + mw * (1 - value)}
              y={my}
              width={mw * value}
              height={10}
              rx={5}
              fill={i < 2 ? BRAND.beige : BRAND.gray}
            />
          </g>
        );
      })}
    </g>
  );
};
