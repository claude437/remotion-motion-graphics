import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { ARABIC_FONT, BRAND } from "../../vitamin-d-ms/theme";

type ArLabelProps = {
  /** Horizontal center in px. */
  readonly x: number;
  /** Top edge in px. */
  readonly y: number;
  readonly text: string;
  /** 0 → 1 entrance (spring): fades and rises into place. */
  readonly progress: number;
  readonly opacity?: number;
  readonly size?: number;
  readonly weight?: 500 | 600 | 700;
  readonly color?: string;
  /** Optional pill background. */
  readonly pill?: string;
};

/** Short Arabic RTL label anchored by its center, used inside diagrams and cards. */
export const ArLabel: React.FC<ArLabelProps> = ({
  x,
  y,
  text,
  progress,
  opacity = 1,
  size = 40,
  weight = 600,
  color = BRAND.charcoal,
  pill,
}) => {
  const o = interpolate(progress, [0, 0.5], [0, 1], CLAMP) * opacity;
  if (o <= 0) return null;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: x - 300,
        top: y,
        width: 600,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        translate: `0 ${interpolate(progress, [0, 1], [18, 0])}px`,
      }}
    >
      <span
        style={{
          fontFamily: ARABIC_FONT,
          fontSize: size,
          fontWeight: weight,
          lineHeight: 1.3,
          color,
          whiteSpace: "nowrap",
          ...(pill
            ? {
                backgroundColor: pill,
                padding: "8px 30px 12px",
                borderRadius: 999,
              }
            : {}),
        }}
      >
        {text}
      </span>
    </div>
  );
};
