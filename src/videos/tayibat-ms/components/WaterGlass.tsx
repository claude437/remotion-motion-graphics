import React from "react";
import { glassPath } from "../shapes";
import { BRAND } from "../theme";

type WaterGlassProps = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** 0 → 1 water level. Water is translucent off-white (never blue). */
  readonly fill: number;
  /** 0 → 1 glass highlights. */
  readonly highlights?: number;
  readonly opacity?: number;
  readonly sec: number;
  readonly id: string;
};

/** Drinking glass with a gently moving water surface and two highlights. */
export const WaterGlass: React.FC<WaterGlassProps> = ({
  x,
  y,
  w,
  h,
  fill,
  highlights = 1,
  opacity = 1,
  sec,
  id,
}) => {
  if (opacity <= 0) return null;
  const outline = glassPath(x, y, w, h);
  const bottom = y + h / 2;
  const level = bottom - (h - 26) * fill;
  const surf = Array.from({ length: 13 }, (_, i) => {
    const px = x - w / 2 - 10 + (i / 12) * (w + 20);
    const py = level + Math.sin(sec * 5 + i * 0.9) * 5 * Math.min(1, fill * 3);
    return `${i ? "L" : "M"} ${px.toFixed(1)} ${py.toFixed(1)}`;
  }).join(" ");
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={outline} />
        </clipPath>
      </defs>
      <path d={outline} fill={BRAND.offWhite} fillOpacity={0.18} />
      {fill > 0 ? (
        <g clipPath={`url(#${id}-clip)`}>
          <path
            d={`${surf} L ${x + w / 2 + 10} ${bottom + 10} L ${x - w / 2 - 10} ${bottom + 10} Z`}
            fill={BRAND.offWhite}
            fillOpacity={0.62}
          />
          <path d={surf} fill="none" stroke={BRAND.offWhite} strokeWidth={5} />
          {[0, 1, 2].map((i) => {
            const by =
              bottom -
              20 -
              ((sec * 60 + i * 50) % Math.max(20, bottom - level - 20));
            return (
              <circle
                key={i}
                cx={x - 40 + i * 40}
                cy={by}
                r={5}
                fill={BRAND.offWhite}
                opacity={0.9 * Math.min(1, fill * 2)}
              />
            );
          })}
        </g>
      ) : null}
      <path
        d={outline}
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={8}
        strokeLinejoin="round"
      />
      {highlights > 0 ? (
        <g opacity={highlights} stroke={BRAND.offWhite} strokeLinecap="round">
          <line
            x1={x - w / 2 + 34}
            y1={y - h / 2 + 50}
            x2={x - w / 2 + 52}
            y2={y + h / 2 - 70}
            strokeWidth={10}
          />
          <line
            x1={x - w / 2 + 64}
            y1={y - h / 2 + 60}
            x2={x - w / 2 + 74}
            y2={y - h / 2 + 150}
            strokeWidth={7}
          />
        </g>
      ) : null}
    </g>
  );
};
