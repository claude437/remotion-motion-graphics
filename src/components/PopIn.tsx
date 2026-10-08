import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, SPRINGS, springIn } from "../lib/animation";

type PopInProps = {
  readonly children: React.ReactNode;
  /** Frame (relative to the parent sequence) when the pop starts. */
  readonly delay?: number;
  /** Starting rotation in degrees; the element springs to 0. */
  readonly fromRotation?: number;
  /** Continuous float amplitude in px after the element has landed (0 = static). */
  readonly float?: number;
  /** Extra scale multiplier, e.g. from `beatPulse()`. */
  readonly pulse?: number;
  readonly style?: React.CSSProperties;
};

/**
 * Springs any element (shape, icon, logo) into place with a bounce, then
 * optionally floats it gently. Position it with `style` (e.g. absolute left/top).
 */
export const PopIn: React.FC<PopInProps> = ({
  children,
  delay = 0,
  fromRotation = -45,
  float = 0,
  pulse = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn({ frame, fps, delay, config: SPRINGS.bouncy });
  const t = (frame - delay) / fps;

  return (
    <div
      style={{
        position: "absolute",
        opacity: interpolate(p, [0, 0.3], [0, 1], CLAMP),
        scale: String(p * (1 + pulse * 0.08)),
        rotate: `${interpolate(p, [0, 1], [fromRotation, 0])}deg`,
        translate: `0 ${Math.sin(Math.max(0, t) * 1.6) * float}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
