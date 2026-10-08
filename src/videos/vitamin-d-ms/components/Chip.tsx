import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { ARABIC_FONT, BRAND } from "../theme";

type ChipProps = {
  /** "=" or "≠" between the Vitamin D mark and the word. */
  readonly relation: "=" | "≠";
  readonly word: string;
  /** Filled (affirmed) or outlined + struck (rejected). */
  readonly variant: "yes" | "no";
  /** 0 → 1 spring entrance. */
  readonly progress: number;
  readonly opacity?: number;
};

/** Mini sun mark used inside chips. */
const MiniSun: React.FC<{ color: string }> = ({ color }) => (
  <svg width={46} height={46} viewBox="-23 -23 46 46">
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return (
        <line
          key={i}
          x1={Math.cos(a) * 14}
          y1={Math.sin(a) * 14}
          x2={Math.cos(a) * 21}
          y2={Math.sin(a) * 21}
          stroke={color}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      );
    })}
    <circle r={10} fill={color} />
  </svg>
);

/** Statement chip: "☀ = دعم" or "☀ ≠ بديل" (RTL). */
export const Chip: React.FC<ChipProps> = ({
  relation,
  word,
  variant,
  progress,
  opacity = 1,
}) => {
  if (progress <= 0 || opacity <= 0) return null;
  const yes = variant === "yes";
  const fg = yes ? BRAND.offWhite : BRAND.charcoal;
  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 34px 16px 30px",
        borderRadius: 999,
        backgroundColor: yes ? BRAND.charcoal : "transparent",
        border: `4px solid ${yes ? BRAND.charcoal : BRAND.charcoal}`,
        fontFamily: ARABIC_FONT,
        fontWeight: 700,
        fontSize: 52,
        lineHeight: 1,
        color: fg,
        opacity: interpolate(progress, [0, 0.4], [0, 1], CLAMP) * opacity,
        scale: String(interpolate(progress, [0, 1], [0.7, 1])),
      }}
    >
      <MiniSun color={yes ? BRAND.orangeBright : BRAND.charcoal} />
      <span style={{ fontSize: 56 }}>{relation}</span>
      <span style={{ position: "relative", paddingBottom: 6 }}>
        {word}
        {yes ? null : (
          <span
            style={{
              position: "absolute",
              right: -6,
              top: "52%",
              height: 6,
              borderRadius: 3,
              backgroundColor: BRAND.charcoal,
              width: `calc(${interpolate(progress, [0.5, 1], [0, 100], CLAMP)}% + 12px)`,
            }}
          />
        )}
      </span>
    </div>
  );
};
