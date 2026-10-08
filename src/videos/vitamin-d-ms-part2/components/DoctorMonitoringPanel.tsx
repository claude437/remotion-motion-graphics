import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { BRAND } from "../../vitamin-d-ms/theme";
import { AXIS, xForIU } from "../timeline";
import { Vial } from "./BloodTestPanel";
import { UPPER_LIMIT_IU } from "./SafetyLimitPanel";

export const MONITOR = {
  doctor: { x: 720, y: 830 },
  tests: { x: 360, y: 830 },
  // Ends left of the 4000 IU wall so its label never overlaps the timeline.
  timeline: { y: 1065, x0: 300, x1: 640, steps: 5 },
  iconR: 78,
} as const;

/** Stethoscope inside a round badge: "doctor" without a human figure. */
export const DoctorIcon: React.FC<{ x: number; y: number; p: number }> = ({
  x,
  y,
  p,
}) => {
  if (p <= 0) return null;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${interpolate(p, [0, 1], [0.6, 1])})`}
      opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP)}
    >
      <circle
        r={MONITOR.iconR}
        fill={BRAND.beige}
        stroke={BRAND.charcoal}
        strokeWidth={6}
      />
      <path
        d="M -30 -44 L -30 -6 C -30 22 30 22 30 -6 L 30 -44"
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d="M 0 16 L 0 34 C 0 52 34 52 34 30 L 34 22"
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <circle
        cx={34}
        cy={14}
        r={11}
        fill={BRAND.orange}
        stroke={BRAND.charcoal}
        strokeWidth={5}
      />
      <circle cx={-30} cy={-48} r={6} fill={BRAND.charcoal} />
      <circle cx={30} cy={-48} r={6} fill={BRAND.charcoal} />
    </g>
  );
};

/** Lab tests badge: a vial inside the same round badge. */
export const TestsIcon: React.FC<{ x: number; y: number; p: number }> = ({
  x,
  y,
  p,
}) => {
  if (p <= 0) return null;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${interpolate(p, [0, 1], [0.6, 1])})`}
      opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP)}
    >
      <circle
        r={MONITOR.iconR}
        fill={BRAND.beige}
        stroke={BRAND.charcoal}
        strokeWidth={6}
      />
      <Vial x={0} y={6} scale={0.42} fill={0.65} id="monitor-vial" />
    </g>
  );
};

type DoctorMonitoringPanelProps = {
  /** 0 → 1: hatched "above the limit" region on the axis. */
  readonly beyond: number;
  /** 0 → 1 springs for the two badges. */
  readonly icons: number;
  /** 0 → 1: periodic follow-up timeline with checks appearing in order. */
  readonly followUp: number;
  /** Where the dose marker (the sun) currently sits. */
  readonly markerX: number;
  readonly opacity: number;
};

/**
 * Higher doses → supervision: the region above 4000 IU/day is hatched, and
 * the dose marker connects to a doctor badge, a lab-test badge and a
 * periodic follow-up timeline.
 */
export const DoctorMonitoringPanel: React.FC<DoctorMonitoringPanelProps> = ({
  beyond,
  icons,
  followUp,
  markerX,
  opacity,
}) => {
  if (opacity <= 0) return null;
  const wx = xForIU(UPPER_LIMIT_IU);
  const { doctor, tests, timeline } = MONITOR;
  const link = `M ${markerX} ${AXIS.y - 44} C ${markerX} ${AXIS.y - 120}, ${timeline.x1 + 40} ${timeline.y + 70}, ${timeline.x1} ${timeline.y + 20}`;
  const linkP = evolvePath(interpolate(icons, [0, 0.6], [0, 1], CLAMP), link);
  // Each timeline end links up to its badge (right end → doctor, left end → tests).
  const up = (fromX: number, toX: number) =>
    `M ${fromX} ${timeline.y - 24} L ${toX} ${doctor.y + MONITOR.iconR + 70}`;
  return (
    <g opacity={opacity}>
      <defs>
        <pattern
          id="beyond-hatch"
          width={16}
          height={16}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width={16} height={16} fill={BRAND.orange} />
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={16}
            stroke={BRAND.charcoal}
            strokeWidth={5}
            opacity={0.35}
          />
        </pattern>
      </defs>
      {beyond > 0 ? (
        <rect
          x={wx}
          y={AXIS.y - 30}
          width={(AXIS.x1 + 10 - wx) * beyond}
          height={60}
          rx={14}
          fill="url(#beyond-hatch)"
        />
      ) : null}
      <path
        d={link}
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={5}
        strokeDasharray={linkP.strokeDasharray}
        strokeDashoffset={linkP.strokeDashoffset}
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* Follow-up timeline */}
      {followUp > 0 || icons > 0 ? (
        <g opacity={interpolate(icons, [0.2, 0.7], [0, 1], CLAMP)}>
          <line
            x1={timeline.x0}
            x2={timeline.x1}
            y1={timeline.y}
            y2={timeline.y}
            stroke={BRAND.gray}
            strokeWidth={6}
            strokeLinecap="round"
          />
          {[
            [timeline.x1, doctor.x],
            [timeline.x0, tests.x],
          ].map(([fromX, toX]) => (
            <path
              key={toX}
              d={up(fromX, toX)}
              stroke={BRAND.charcoal}
              strokeWidth={4}
              strokeDasharray="3 12"
              strokeLinecap="round"
              opacity={0.5}
              fill="none"
            />
          ))}
          {Array.from({ length: timeline.steps }, (_, i) => {
            // Checks fill right → left (RTL), one per follow-up visit.
            const tx =
              timeline.x1 -
              (i / (timeline.steps - 1)) * (timeline.x1 - timeline.x0);
            const on = interpolate(
              followUp,
              [i / timeline.steps, (i + 0.7) / timeline.steps],
              [0, 1],
              CLAMP,
            );
            return (
              <g key={i} transform={`translate(${tx} ${timeline.y})`}>
                <circle
                  r={22}
                  fill={on > 0.5 ? BRAND.charcoal : BRAND.offWhite}
                  stroke={BRAND.charcoal}
                  strokeWidth={5}
                />
                {on > 0 ? (
                  <path
                    d="M -9 0 L -2 7 L 10 -7"
                    fill="none"
                    stroke={BRAND.orangeBright}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={on}
                  />
                ) : null}
              </g>
            );
          })}
        </g>
      ) : null}
      <DoctorIcon x={doctor.x} y={doctor.y} p={icons} />
      <TestsIcon
        x={tests.x}
        y={tests.y}
        p={interpolate(icons, [0.15, 1], [0, 1], CLAMP)}
      />
    </g>
  );
};
