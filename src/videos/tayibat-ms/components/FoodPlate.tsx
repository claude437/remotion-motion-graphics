import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { FishIcon } from "../../vitamin-d-ms-part2/components/SourceIcons";
import { sectorCenter, sectorPath } from "../shapes";
import { BRAND } from "../theme";

/** Five food groups, clockwise from the top. Fills stay inside the brand palette. */
export const FOOD_GROUPS = [
  { id: "vegetables", fill: BRAND.beige },
  { id: "legumes", fill: BRAND.offWhite },
  { id: "grains", fill: BRAND.gray },
  { id: "fruit", fill: BRAND.orangeBright },
  { id: "protein", fill: BRAND.offWhite },
] as const;

export const SECTOR_DEG = 360 / FOOD_GROUPS.length;
export const sectorAngles = (i: number, rotation = 0) =>
  [i * SECTOR_DEG + rotation, (i + 1) * SECTOR_DEG + rotation] as const;

const S = { stroke: BRAND.charcoal, sw: 5 } as const;

export const LeafIcon: React.FC = () => (
  <g>
    <path
      d="M -30 26 C -34 -18 4 -40 34 -34 C 38 6 10 34 -30 26 Z"
      fill={BRAND.orange}
      stroke={S.stroke}
      strokeWidth={S.sw}
      strokeLinejoin="round"
    />
    <path
      d="M -30 26 C -8 6 10 -10 26 -26"
      fill="none"
      stroke={S.stroke}
      strokeWidth={4}
      strokeLinecap="round"
    />
  </g>
);

export const BeanPodIcon: React.FC = () => (
  <g transform="rotate(-25)">
    <path
      d="M -44 0 C -40 -22 40 -22 44 0 C 40 22 -40 22 -44 0 Z"
      fill={BRAND.beige}
      stroke={S.stroke}
      strokeWidth={S.sw}
    />
    {[-22, 0, 22].map((x) => (
      <circle
        key={x}
        cx={x}
        cy={0}
        r={9}
        fill={BRAND.orange}
        stroke={S.stroke}
        strokeWidth={3.5}
      />
    ))}
  </g>
);

export const WheatIcon: React.FC = () => (
  <g>
    <path
      d="M 0 40 L 0 -34"
      stroke={S.stroke}
      strokeWidth={S.sw}
      strokeLinecap="round"
    />
    {[-22, -6, 10].map((y) => (
      <g key={y}>
        <ellipse
          cx={-11}
          cy={y}
          rx={8}
          ry={13}
          transform={`rotate(-30 -11 ${y})`}
          fill={BRAND.beige}
          stroke={S.stroke}
          strokeWidth={3.5}
        />
        <ellipse
          cx={11}
          cy={y}
          rx={8}
          ry={13}
          transform={`rotate(30 11 ${y})`}
          fill={BRAND.beige}
          stroke={S.stroke}
          strokeWidth={3.5}
        />
      </g>
    ))}
    <ellipse
      cx={0}
      cy={-38}
      rx={7}
      ry={11}
      fill={BRAND.beige}
      stroke={S.stroke}
      strokeWidth={3.5}
    />
  </g>
);

export const AppleIcon: React.FC = () => (
  <g>
    <path
      d="M 0 -18 C -18 -32 -42 -20 -38 6 C -34 30 -14 40 0 32 C 14 40 34 30 38 6 C 42 -20 18 -32 0 -18 Z"
      fill={BRAND.offWhite}
      stroke={S.stroke}
      strokeWidth={S.sw}
      strokeLinejoin="round"
    />
    <path
      d="M 0 -18 C 0 -28 4 -36 8 -40"
      fill="none"
      stroke={S.stroke}
      strokeWidth={4}
      strokeLinecap="round"
    />
    <path
      d="M 6 -32 C 16 -42 28 -38 30 -30 C 20 -26 12 -26 6 -32 Z"
      fill={BRAND.beige}
      stroke={S.stroke}
      strokeWidth={3}
    />
  </g>
);

const ICONS = [
  () => <LeafIcon />,
  () => <BeanPodIcon />,
  () => <WheatIcon />,
  () => <AppleIcon />,
  (sec: number) => (
    <g transform="scale(0.42)">
      <FishIcon sec={sec} />
    </g>
  ),
];

export type SectorState = {
  /** 0 = in place, 1 = slid fully away (restriction). */
  readonly out: number;
  readonly opacity: number;
};

type FoodPlateProps = {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly rotation?: number;
  readonly sectors: readonly SectorState[];
  /** Dashed outline where a removed sector used to be (0 → 1). */
  readonly emptyOutlines?: number;
  readonly iconOpacity?: number;
  readonly rimOpacity?: number;
  readonly opacity?: number;
  readonly sec: number;
};

/**
 * Balanced plate with five food-group sectors. Removing a group slides its
 * sector away and leaves a dashed empty space: restriction, not "bad food".
 */
export const FoodPlate: React.FC<FoodPlateProps> = ({
  x,
  y,
  r,
  rotation = 0,
  sectors,
  emptyOutlines = 0,
  iconOpacity = 1,
  rimOpacity = 1,
  opacity = 1,
  sec,
}) => {
  if (opacity <= 0 || r <= 1) return null;
  return (
    <g opacity={opacity}>
      {/* Plate rim */}
      <g opacity={rimOpacity}>
        <circle
          cx={x}
          cy={y}
          r={r + 34}
          fill={BRAND.offWhite}
          stroke={BRAND.charcoal}
          strokeWidth={7}
          filter="url(#tay-shadow)"
        />
        <circle
          cx={x}
          cy={y}
          r={r + 10}
          fill={BRAND.offWhite}
          stroke={BRAND.gray}
          strokeWidth={4}
        />
      </g>
      {FOOD_GROUPS.map((g, i) => {
        const [a0, a1] = sectorAngles(i, rotation);
        const st = sectors[i];
        const c = sectorCenter(x, y, r, a0, a1);
        const dx = Math.cos(c.angle) * r * 0.7 * st.out;
        const dy = Math.sin(c.angle) * r * 0.7 * st.out;
        const d = sectorPath(x, y, r, a0 + 1.5, a1 - 1.5);
        return (
          <g key={g.id}>
            {emptyOutlines > 0 && st.out > 0 ? (
              <path
                d={d}
                fill="none"
                stroke={BRAND.charcoal}
                strokeWidth={4}
                strokeDasharray="10 9"
                opacity={0.6 * emptyOutlines * Math.min(1, st.out * 2)}
              />
            ) : null}
            {st.opacity > 0 ? (
              <g
                transform={`translate(${dx} ${dy})`}
                opacity={
                  st.opacity *
                  (1 - interpolate(st.out, [0.5, 1], [0, 1], CLAMP))
                }
              >
                <path
                  d={d}
                  fill={g.fill}
                  stroke={BRAND.charcoal}
                  strokeWidth={S.sw}
                  strokeLinejoin="round"
                />
                {iconOpacity > 0 ? (
                  <g
                    transform={`translate(${c.x} ${c.y}) scale(${r / 250})`}
                    opacity={iconOpacity}
                  >
                    {ICONS[i](sec)}
                  </g>
                ) : null}
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
