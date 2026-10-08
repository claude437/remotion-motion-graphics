import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate } from "remotion";
import { CLAMP } from "../../../lib/animation";
import { BRAND } from "../../vitamin-d-ms/theme";
import { Vial } from "./BloodTestPanel";

type DoseDecisionPanelProps = {
  /** Meter track geometry (the flattened nerve draws the line itself). */
  readonly meterY: number;
  readonly meterLeft: number;
  readonly lowRight: number;
  /** 0 → 1: low zone band on the meter. */
  readonly low: number;
  /** 0 → 1 springs: input nodes and the dose node. */
  readonly inputs: number;
  readonly node: number;
  /** Seconds since the dose node appeared; drives the adjusting dial. */
  readonly nodeSec: number;
  readonly opacity: number;
};

export const DECISION = {
  testPill: { x: 700, y: 980 },
  conditionPill: { x: 380, y: 980 },
  node: { x: 540, y: 1215 },
  pill: { w: 290, h: 100 },
} as const;

const Pill: React.FC<{
  x: number;
  y: number;
  p: number;
  children: React.ReactNode;
}> = ({ x, y, p, children }) => {
  if (p <= 0) return null;
  const { w, h } = DECISION.pill;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${interpolate(p, [0, 1], [0.7, 1])})`}
      opacity={interpolate(p, [0, 0.4], [0, 1], CLAMP)}
    >
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={BRAND.beige}
        stroke={BRAND.charcoal}
        strokeWidth={6}
      />
      {children}
    </g>
  );
};

/** Clipboard: the person's own condition (no human figure, per brand rules). */
const ConditionIcon: React.FC = () => (
  <g transform="translate(95 0)">
    <rect
      x={-24}
      y={-32}
      width={48}
      height={62}
      rx={8}
      fill={BRAND.offWhite}
      stroke={BRAND.charcoal}
      strokeWidth={5}
    />
    <rect x={-12} y={-40} width={24} height={14} rx={4} fill={BRAND.charcoal} />
    <path
      d="M -14 4 L -6 4 L -1 -8 L 5 14 L 9 4 L 15 4"
      fill="none"
      stroke={BRAND.orange}
      strokeWidth={4}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </g>
);

/**
 * Decision flow: LOW result on the meter feeds two inputs (the test and the
 * person's condition) that together set the dose. The dial keeps adjusting
 * and never shows a number: there is no single dose for everyone.
 */
export const DoseDecisionPanel: React.FC<DoseDecisionPanelProps> = ({
  meterY,
  meterLeft,
  lowRight,
  low,
  inputs,
  node,
  nodeSec,
  opacity,
}) => {
  if (opacity <= 0) return null;
  const { testPill, conditionPill } = DECISION;
  const n = DECISION.node;
  const flowIn = `M 540 ${meterY + 70} C 540 ${meterY + 120}, ${testPill.x} ${testPill.y - 110}, ${testPill.x} ${testPill.y - 52}`;
  const flowIn2 = `M 540 ${meterY + 70} C 540 ${meterY + 120}, ${conditionPill.x} ${conditionPill.y - 110}, ${conditionPill.x} ${conditionPill.y - 52}`;
  const flowOut = `M ${testPill.x} ${testPill.y + 52} C ${testPill.x} ${n.y - 110}, 560 ${n.y - 120}, 560 ${n.y - 62}`;
  const flowOut2 = `M ${conditionPill.x} ${conditionPill.y + 52} C ${conditionPill.x} ${n.y - 110}, 520 ${n.y - 120}, 520 ${n.y - 62}`;
  const draw = (d: string, p: number, key: string) => {
    const e = evolvePath(p, d);
    return (
      <path
        key={key}
        d={d}
        fill="none"
        stroke={BRAND.charcoal}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={e.strokeDasharray}
        strokeDashoffset={e.strokeDashoffset}
        opacity={0.55}
      />
    );
  };
  // Dial needle sweeps while "adjusting", then settles: personalized, not fixed.
  const needle = interpolate(
    nodeSec,
    [0, 0.35, 0.7, 1.0, 1.3],
    [-70, 45, -25, 15, 5],
    CLAMP,
  );

  return (
    <g opacity={opacity}>
      {/* Low zone band, behind the meter line */}
      <rect
        x={meterLeft}
        y={meterY - 17}
        width={(lowRight - meterLeft) * low}
        height={34}
        rx={17}
        fill={BRAND.orange}
        opacity={0.85}
      />
      {draw(flowIn, interpolate(inputs, [0, 0.6], [0, 1], CLAMP), "a")}
      {draw(flowIn2, interpolate(inputs, [0, 0.6], [0, 1], CLAMP), "b")}
      {draw(flowOut, interpolate(node, [0, 0.6], [0, 1], CLAMP), "c")}
      {draw(flowOut2, interpolate(node, [0, 0.6], [0, 1], CLAMP), "d")}

      <Pill x={testPill.x} y={testPill.y} p={inputs}>
        <Vial x={95} y={4} scale={0.3} fill={0.7} id="decision-vial" />
      </Pill>
      <Pill
        x={conditionPill.x}
        y={conditionPill.y}
        p={interpolate(inputs, [0.15, 1], [0, 1], CLAMP)}
      >
        <ConditionIcon />
      </Pill>

      {node > 0 ? (
        <g
          transform={`translate(${n.x} ${n.y}) scale(${interpolate(node, [0, 1], [0.7, 1])})`}
          opacity={interpolate(node, [0, 0.4], [0, 1], CLAMP)}
        >
          <rect
            x={-210}
            y={-62}
            width={420}
            height={124}
            rx={62}
            fill={BRAND.charcoal}
          />
          {/* Dial */}
          <g transform="translate(140 10)">
            <path
              d="M -40 0 A 40 40 0 0 1 40 0"
              fill="none"
              stroke={BRAND.gray}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={0.5}
            />
            <path
              d="M -40 0 A 40 40 0 0 1 0 -40"
              fill="none"
              stroke={BRAND.orange}
              strokeWidth={8}
              strokeLinecap="round"
            />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={-34}
              stroke={BRAND.offWhite}
              strokeWidth={6}
              strokeLinecap="round"
              transform={`rotate(${needle})`}
            />
            <circle r={8} fill={BRAND.offWhite} />
          </g>
        </g>
      ) : null}
    </g>
  );
};
