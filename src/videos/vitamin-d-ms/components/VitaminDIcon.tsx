import React from "react";
import { BRAND, ARABIC_FONT } from "../theme";

type VitaminDIconProps = {
  readonly x: number;
  readonly y: number;
  /** Outer diameter including rays, in px. */
  readonly size: number;
  /** 0 → 1: how far the rays have extended. */
  readonly rays?: number;
  /** Rotation of the ray ring in degrees (slow idle spin). */
  readonly spin?: number;
  /** 0 → 1: strength of the soft halo. */
  readonly glow?: number;
  readonly opacity?: number;
  /** Unique id prefix for gradients when several icons are on screen. */
  readonly id?: string;
};

const RAY_COUNT = 12;

/** Stylized Vitamin D sun: off-white disc with a "D", rounded rays and a soft halo. */
export const VitaminDIcon: React.FC<VitaminDIconProps> = ({
  x,
  y,
  size,
  rays = 1,
  spin = 0,
  glow = 0.6,
  opacity = 1,
  id = "vd",
}) => {
  if (size <= 0.5 || opacity <= 0) return null;
  const r = size / 2;
  const core = r * 0.6;
  const rayInner = r * 0.74;
  const rayOuter = rayInner + (r - rayInner) * rays;

  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0%" stopColor={BRAND.offWhite} stopOpacity={0.55} />
          <stop offset="100%" stopColor={BRAND.offWhite} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={r * 1.35} fill={`url(#${id}-halo)`} opacity={glow} />
      <g transform={`rotate(${spin})`}>
        {rays > 0.01
          ? Array.from({ length: RAY_COUNT }, (_, i) => {
              const a = (i / RAY_COUNT) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * rayInner}
                  y1={Math.sin(a) * rayInner}
                  x2={Math.cos(a) * rayOuter}
                  y2={Math.sin(a) * rayOuter}
                  stroke={BRAND.offWhite}
                  strokeWidth={Math.max(2, size * 0.045)}
                  strokeLinecap="round"
                />
              );
            })
          : null}
      </g>
      <circle r={core} fill={BRAND.offWhite} />
      <circle
        r={core * 0.8}
        fill="none"
        stroke={BRAND.orange}
        strokeWidth={Math.max(1.5, size * 0.018)}
      />
      <text
        y={core * 0.36}
        textAnchor="middle"
        fontFamily={ARABIC_FONT}
        fontWeight={700}
        fontSize={core * 1.05}
        fill={BRAND.charcoal}
      >
        D
      </text>
    </g>
  );
};
