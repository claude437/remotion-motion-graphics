import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, SPRINGS, springIn, stagger } from "../lib/animation";

type AnimatedTextProps = {
  readonly text: string;
  /** Animate word by word (default) or character by character. */
  readonly by?: "word" | "char";
  /** Frame (relative to the parent sequence) when the first unit starts. */
  readonly delay?: number;
  /** Frames between consecutive units. */
  readonly staggerFrames?: number;
  /** Reveal style: rise out of a mask, or fade + de-blur in place. */
  readonly variant?: "rise" | "blur";
  readonly style?: React.CSSProperties;
  /** Style applied to each word/char, e.g. a gradient fill. */
  readonly unitStyle?: React.CSSProperties;
};

/**
 * Staggered typography reveal. Each unit is driven by a spring so the motion
 * stays smooth at any frame rate.
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  by = "word",
  delay = 0,
  staggerFrames = 4,
  variant = "rise",
  style,
  unitStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const units = by === "word" ? text.split(" ") : Array.from(text);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: by === "word" ? "0.28em" : 0,
        ...style,
      }}
    >
      {units.map((unit, i) => {
        const p = springIn({
          frame,
          fps,
          delay: stagger(i, staggerFrames, delay),
          config: SPRINGS.smooth,
          durationInFrames: Math.round(0.8 * fps),
        });

        return (
          <span
            key={`${unit}-${i}`}
            style={{
              display: "inline-block",
              overflow: variant === "rise" ? "hidden" : "visible",
              // Extra room so descenders and gradient fills aren't clipped.
              padding: "0.08em 0.02em 0.14em",
              margin: "-0.08em -0.02em -0.14em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                opacity: interpolate(p, [0, 0.4], [0, 1], CLAMP),
                translate:
                  variant === "rise"
                    ? `0 ${interpolate(p, [0, 1], [110, 0])}%`
                    : undefined,
                filter:
                  variant === "blur"
                    ? `blur(${interpolate(p, [0, 1], [16, 0])}px)`
                    : undefined,
                scale:
                  variant === "blur"
                    ? interpolate(p, [0, 1], [1.15, 1])
                    : undefined,
                ...unitStyle,
              }}
            >
              {unit}
            </span>
          </span>
        );
      })}
    </div>
  );
};
