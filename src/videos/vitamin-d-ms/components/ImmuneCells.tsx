import React from "react";
import { interpolateColors } from "remotion";
import { BRAND } from "../theme";

export type CellState = {
  readonly x: number;
  readonly y: number;
  /** Radius in px. Tiny radii render as plain graph dots. */
  readonly r: number;
  /** 0 = calm (off-white), 1 = activated (charcoal, extended receptors). */
  readonly activation: number;
  /** 0 → 1: receptors + membrane detail. 0 renders a simple data-point dot. */
  readonly detail: number;
  readonly opacity: number;
  /** Rotation of the receptor ring in degrees. */
  readonly spin: number;
};

const RECEPTORS = 8;

/** Simplified immune cells. The same objects double as chart dots (detail = 0). */
export const ImmuneCells: React.FC<{
  readonly cells: readonly CellState[];
}> = ({ cells }) => {
  return (
    <g>
      {cells.map((c, i) => {
        if (c.opacity <= 0 || c.r <= 0.5) return null;
        // As a chart dot (detail 0) it matches the charcoal MS line.
        const fill = interpolateColors(
          c.detail,
          [0, 1],
          [
            BRAND.charcoal,
            interpolateColors(
              c.activation,
              [0, 1],
              [BRAND.offWhite, BRAND.charcoal],
            ),
          ],
        );
        const nucleus = interpolateColors(
          c.activation,
          [0, 1],
          [BRAND.beige, BRAND.orangeBright],
        );
        const receptorLen = c.r * (0.28 + 0.22 * c.activation) * c.detail;
        return (
          <g key={i} transform={`translate(${c.x} ${c.y})`} opacity={c.opacity}>
            {c.detail > 0.01 ? (
              <g transform={`rotate(${c.spin})`} opacity={c.detail}>
                {Array.from({ length: RECEPTORS }, (_, k) => {
                  const a = (k / RECEPTORS) * Math.PI * 2;
                  const x1 = Math.cos(a) * c.r;
                  const y1 = Math.sin(a) * c.r;
                  const x2 = Math.cos(a) * (c.r + receptorLen);
                  const y2 = Math.sin(a) * (c.r + receptorLen);
                  // Y-shaped receptor tip.
                  const side = receptorLen * 0.45;
                  const pa = a + Math.PI / 2;
                  return (
                    <g key={k}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={BRAND.charcoal}
                        strokeWidth={4}
                        strokeLinecap="round"
                      />
                      <line
                        x1={x2}
                        y1={y2}
                        x2={x2 + Math.cos(a) * side + Math.cos(pa) * side}
                        y2={y2 + Math.sin(a) * side + Math.sin(pa) * side}
                        stroke={BRAND.charcoal}
                        strokeWidth={4}
                        strokeLinecap="round"
                      />
                      <line
                        x1={x2}
                        y1={y2}
                        x2={x2 + Math.cos(a) * side - Math.cos(pa) * side}
                        y2={y2 + Math.sin(a) * side - Math.sin(pa) * side}
                        stroke={BRAND.charcoal}
                        strokeWidth={4}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </g>
            ) : null}
            <circle
              r={c.r}
              fill={fill}
              stroke={BRAND.charcoal}
              strokeWidth={c.detail > 0.01 ? 5 : 0}
            />
            {c.detail > 0.01 ? (
              <circle r={c.r * 0.42} fill={nucleus} opacity={c.detail} />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
