import React from "react";
import { interpolate, spring } from "remotion";
import { CLAMP, EASE } from "../../../lib/animation";
import { ARABIC_FONT, BRAND } from "../theme";

export type KineticLine = {
  readonly text: string;
  readonly size: number;
  readonly weight?: 500 | 600 | 700;
  readonly color?: string;
};

type KineticTextProps = {
  /** Global frame and fps (the text is timed in absolute seconds). */
  readonly frame: number;
  readonly fps: number;
  readonly lines: readonly KineticLine[];
  /** Seconds when the first word starts entering. */
  readonly inAt: number;
  /** Seconds when the block starts leaving. Omit to stay on screen. */
  readonly outAt?: number;
  /** Top edge of the block in px. */
  readonly top: number;
  /** Seconds between consecutive words. */
  readonly stagger?: number;
  /** Text block insets from the frame edges (px). Defaults match the Vitamin D videos. */
  readonly left?: number;
  readonly right?: number;
  readonly fontFamily?: string;
};

/**
 * Arabic kinetic typography. Animates WORD by word (never by letter, which
 * would break Arabic joining), in RTL reading order: words rise, de-blur and
 * settle on a spring; on exit the block lifts and blurs away.
 */
export const KineticText: React.FC<KineticTextProps> = ({
  frame,
  fps,
  lines,
  inAt,
  outAt,
  top,
  stagger = 0.07,
  left = 100,
  right = 120,
  fontFamily = ARABIC_FONT,
}) => {
  const exit =
    outAt === undefined
      ? 0
      : interpolate(frame, [outAt * fps, (outAt + 0.35) * fps], [0, 1], {
          ...CLAMP,
          easing: EASE.in,
        });
  if (frame < inAt * fps - 1 || exit >= 1) return null;

  let wordIndex = 0;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top,
        left,
        right,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        fontFamily,
        direction: "rtl",
        textAlign: "center",
        opacity: 1 - exit,
        translate: `0 ${-40 * exit}px`,
        filter: exit > 0 ? `blur(${10 * exit}px)` : undefined,
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: "0.28em",
            fontSize: line.size,
            fontWeight: line.weight ?? 700,
            color: line.color ?? BRAND.charcoal,
            lineHeight: 1.35,
          }}
        >
          {line.text.split(" ").map((word, wi) => {
            const delay = (inAt + stagger * wordIndex++) * fps;
            const p = spring({
              frame: frame - delay,
              fps,
              config: { damping: 200 },
              durationInFrames: Math.round(0.7 * fps),
            });
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  opacity: interpolate(p, [0, 0.5], [0, 1], CLAMP),
                  translate: `0 ${interpolate(p, [0, 1], [0.45, 0])}em`,
                  filter:
                    p < 1
                      ? `blur(${interpolate(p, [0, 1], [12, 0])}px)`
                      : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
