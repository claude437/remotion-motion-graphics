import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CLAMP } from "../../lib/animation";
// Reused from Part 1: brand system, background, grain, typography, icons, transitions.
import { BrandBackground } from "../vitamin-d-ms/components/BrandBackground";
import { Chip } from "../vitamin-d-ms/components/Chip";
import { FilmGrain } from "../vitamin-d-ms/components/FilmGrain";
import { KineticText } from "../vitamin-d-ms/components/KineticText";
import { NerveMyelin } from "../vitamin-d-ms/components/NerveMyelin";
import { SceneTransition } from "../vitamin-d-ms/components/SceneTransition";
import { TreatmentIcon } from "../vitamin-d-ms/components/TreatmentIcon";
import { VitaminDIcon } from "../vitamin-d-ms/components/VitaminDIcon";
import { ARABIC_FONT, BRAND } from "../vitamin-d-ms/theme";
// New for Part 2.
import { usePart2Choreography } from "./choreography";
import { ArLabel } from "./components/ArLabel";
import { BloodTestPanel } from "./components/BloodTestPanel";
import { BoneHealthIcon } from "./components/BoneHealthIcon";
import { DECISION, DoseDecisionPanel } from "./components/DoseDecisionPanel";
import { BigValue, DoseCard } from "./components/DoseCard";
import {
  DoctorMonitoringPanel,
  MONITOR,
} from "./components/DoctorMonitoringPanel";
import { CalciumIndicator, KidneyWarning } from "./components/KidneyWarning";
import { SafetyLimitPanel } from "./components/SafetyLimitPanel";
import {
  FishIcon,
  FortifiedFoodIcon,
  SourceCell,
  SupplementIcon,
} from "./components/SourceIcons";
import { CUE, LAYOUT, SCENES, TRANSITIONS } from "./timeline";

/** Scene typography stays mounted this long (s) past its scene so exits can finish. */
const TEXT_TAIL = 0.5;
const SCENE_LIST = Object.values(SCENES);

/**
 * "Vitamin D & MS — Part 2": 20 s vertical explainer (1080×1920, 60 fps).
 * Opens exactly on Part 1's final frame and continues the same continuous
 * morph: sun = lab icon → meter marker → dose marker; nerve = result track →
 * dose axis → nerve; one panel = lab card → decision → dose/limit/monitoring
 * → caution → first source cell. Timing lives in timeline.ts.
 */
export const VitaminDMSPart2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const c = usePart2Choreography(frame, fps);
  const { sec, sp, prog } = c;
  const f = (s: number) => Math.round(s * fps);
  const between = (a: number, b: number, fadeIn = 0.3, fadeOut = 0.3) =>
    interpolate(sec, [a, a + fadeIn, b, b + fadeOut], [0, 1, 1, 0], CLAMP);
  const pop = (at: number) => sp(at, { damping: 14, stiffness: 150 });

  const boneOut = prog(CUE.toTest, CUE.toTest + 0.4);
  const boneLinks = between(CUE.boneLinkIn, CUE.toTest - 0.1, 0.4, 0.25);
  const finalLink = interpolate(
    sec,
    [CUE.nerveRedrawEnd - 0.1, CUE.nerveRedrawEnd + 0.4],
    [0, 1],
    CLAMP,
  );
  const valueSwap = prog(CUE.numberSwap, CUE.numberSwap + 0.35);
  const limitOut = prog(CUE.numberOut, CUE.numberOut + 0.35);
  const sourcesOut = prog(CUE.toSummary, CUE.toSummary + 0.4);
  const cautionOpacity = between(
    CUE.toCaution + 0.2,
    CUE.toSources - 0.15,
    0.3,
    0.2,
  );
  const ix = (i: number) => LAYOUT.cells[i];

  return (
    <AbsoluteFill
      style={{ backgroundColor: BRAND.orange, fontFamily: ARABIC_FONT }}
    >
      <BrandBackground
        frame={frame}
        fps={fps}
        width={width}
        height={height}
        focus={[
          [0, 1020],
          [SCENES.test.start + 0.5, 980],
          [SCENES.decision.start + 0.5, 1000],
          [SCENES.sources.start + 0.5, 1040],
          [SCENES.summary.start + 0.5, 980],
          [20, 1000],
        ]}
        morphTimes={SCENE_LIST.map((s) => s.start + 0.6)}
      />

      {/* ---------- Vector stage ---------- */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute" }}
      >
        <defs>
          <filter id="p2-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow
              dx={0}
              dy={26}
              stdDeviation={28}
              floodColor={BRAND.orangeShadow}
              floodOpacity={0.55}
            />
          </filter>
        </defs>

        {TRANSITIONS.map((t) => (
          <SceneTransition
            key={t.at}
            frame={frame}
            fps={fps}
            at={t.at}
            x={t.x}
            y={t.y}
          />
        ))}

        {/* Scene 1: support links sun → bone → nerve (Part 1's dotted style). */}
        {boneLinks > 0 ? (
          <g opacity={0.75 * boneLinks}>
            <path
              d={`M ${c.sun.x + 70} ${c.sun.y + 40} C ${c.sun.x + 130} ${c.sun.y + 90}, ${LAYOUT.bone.x - 220} ${LAYOUT.bone.y - 40}, ${LAYOUT.bone.x - 150} ${LAYOUT.bone.y + 10}`}
              fill="none"
              stroke={BRAND.charcoal}
              strokeWidth={5}
              strokeDasharray="4 16"
              strokeLinecap="round"
              strokeDashoffset={-sec * 40}
            />
            <path
              d={`M ${LAYOUT.bone.x - 30} ${LAYOUT.bone.y + 110} C ${LAYOUT.bone.x - 40} ${LAYOUT.bone.y + 200}, ${LAYOUT.boneNerve.x} ${LAYOUT.boneNerve.y - 140}, ${LAYOUT.boneNerve.x} ${LAYOUT.boneNerve.y - 40}`}
              fill="none"
              stroke={BRAND.charcoal}
              strokeWidth={5}
              strokeDasharray="4 16"
              strokeLinecap="round"
              strokeDashoffset={-sec * 40}
            />
          </g>
        ) : null}
        {/* Final: Part 1's support link sun → nerve. */}
        {finalLink > 0 ? (
          <path
            d={`M ${LAYOUT.finalSun.x} ${LAYOUT.finalSun.y + 96} C ${LAYOUT.finalSun.x} ${LAYOUT.finalNerve.y - 120}, ${LAYOUT.finalSun.x + 40} ${LAYOUT.finalNerve.y - 70}, ${LAYOUT.finalSun.x + 70} ${LAYOUT.finalNerve.y - 36}`}
            fill="none"
            stroke={BRAND.charcoal}
            strokeWidth={5}
            strokeDasharray="4 16"
            strokeLinecap="round"
            strokeDashoffset={-sec * 40}
            opacity={0.75 * finalLink}
          />
        ) : null}

        <BoneHealthIcon
          x={LAYOUT.bone.x}
          y={LAYOUT.bone.y}
          scale={
            0.85 *
            sp(CUE.boneIn, { damping: 15, stiffness: 120 }) *
            (1 - 0.6 * boneOut)
          }
          draw={prog(CUE.boneIn, CUE.boneDrawEnd)}
          ring={between(CUE.boneDrawEnd - 0.3, CUE.toTest - 0.2, 0.4, 0.3)}
          spin={sec * 8}
          opacity={1 - boneOut}
        />

        {/* Morphing panel (same surface + shadow as Part 1's card). */}
        {c.panel.w > 1 && c.panel.h > 1 && c.panel.opacity > 0 ? (
          <rect
            x={c.panel.x - c.panel.w / 2}
            y={c.panel.y - c.panel.h / 2}
            width={c.panel.w}
            height={c.panel.h}
            rx={Math.min(c.panel.radius, c.panel.h / 2)}
            fill={BRAND.offWhite}
            opacity={c.panel.opacity}
            filter="url(#p2-shadow)"
          />
        ) : null}

        <BloodTestPanel
          x={LAYOUT.testCard.x}
          y={LAYOUT.testCard.y}
          opacity={between(CUE.toTest + 0.3, CUE.toDecision, 0.3, 0.25)}
          fill={prog(CUE.vialFill, CUE.vialFillEnd)}
          badge={pop(CUE.stepBadgeIn)}
          sec={sec}
          trackY={LAYOUT.testTrack.y}
        />

        <DoseDecisionPanel
          meterY={LAYOUT.meter.y}
          meterLeft={LAYOUT.meter.x - LAYOUT.meter.width / 2}
          lowRight={LAYOUT.meter.x - LAYOUT.meter.width / 2 + 200}
          low={prog(CUE.lowMarker, CUE.lowMarker + 0.5)}
          inputs={sp(CUE.inputsIn)}
          node={pop(CUE.doseNodeIn)}
          nodeSec={sec - CUE.doseNodeIn}
          opacity={between(CUE.toDecision + 0.15, CUE.toDaily, 0.25, 0.25)}
        />

        {/* Dose axis scenes (4–6): range, safe zone + wall, supervision. */}
        <SafetyLimitPanel
          zone={prog(CUE.zoneFill, CUE.zoneFillEnd)}
          wall={prog(CUE.wallIn, CUE.wallIn + 0.6, (t) => t)}
          hit={
            sec > CUE.crossWall + 0.3
              ? prog(CUE.crossWall + 0.3, CUE.crossWall + 0.9) *
                (sec < CUE.crossWall + 0.9 ? 1 : 0)
              : 0
          }
          opacity={between(CUE.numberSwap, CUE.toCaution, 0.2, 0.3)}
        />
        <DoseCard
          axis={prog(CUE.toDaily + 0.3, CUE.toDaily + 0.7)}
          range={prog(CUE.rangeIn, CUE.rangeIn + 0.6)}
          opacity={between(CUE.toDaily + 0.2, CUE.toCaution, 0.3, 0.3)}
        />
        <DoctorMonitoringPanel
          beyond={prog(CUE.crossWall + 0.3, CUE.crossWall + 0.8)}
          icons={pop(CUE.monitorIn)}
          followUp={prog(CUE.followUp, CUE.followUpEnd)}
          markerX={c.sun.x}
          opacity={between(CUE.crossWall, CUE.toCaution, 0.2, 0.3)}
        />
        <BigValue
          x={540}
          y={930}
          value="600–800"
          unit="IU/day"
          progress={sp(CUE.numberIn)}
          exit={valueSwap}
        />
        <BigValue
          x={540}
          y={930}
          value="4000"
          unit="IU/day"
          caption="UPPER SAFE LIMIT"
          progress={sp(CUE.numberSwap + 0.25)}
          exit={limitOut}
        />

        <NerveMyelin {...c.nerve} />

        {/* Scene 7: calcium ↑ and kidney cautions. */}
        {cautionOpacity > 0 ? (
          <path
            d={`M ${LAYOUT.calciumSun.x + 62} ${LAYOUT.calciumSun.y} L 444 ${LAYOUT.calciumSun.y}`}
            stroke={BRAND.charcoal}
            strokeWidth={5}
            strokeDasharray="4 14"
            strokeLinecap="round"
            strokeDashoffset={-sec * 40}
            opacity={
              0.6 *
              cautionOpacity *
              prog(CUE.calciumUp - 0.2, CUE.calciumUp + 0.2)
            }
          />
        ) : null}
        <CalciumIndicator
          x={540}
          y={830}
          progress={pop(CUE.toCautionEnd - 0.1)}
          rise={prog(CUE.calciumUp, CUE.calciumUpEnd)}
          opacity={cautionOpacity}
        />
        <KidneyWarning
          x={720}
          y={1140}
          variant="stones"
          progress={pop(CUE.kidneysIn[0])}
          sec={sec}
          opacity={cautionOpacity}
        />
        <KidneyWarning
          x={360}
          y={1140}
          variant="warning"
          progress={pop(CUE.kidneysIn[1])}
          sec={sec}
          opacity={cautionOpacity}
        />

        {/* Scene 8: sources unfold from the first cell (the morphed panel). */}
        <SourceCell
          x={ix(1).x}
          y={ix(1).y}
          size={LAYOUT.cellSize}
          from={ix(0)}
          progress={pop(CUE.cellsIn[0])}
          opacity={1 - sourcesOut}
        >
          <FishIcon sec={sec} />
        </SourceCell>
        <SourceCell
          x={ix(2).x}
          y={ix(2).y}
          size={LAYOUT.cellSize}
          from={ix(0)}
          progress={pop(CUE.cellsIn[1])}
          opacity={1 - sourcesOut}
        >
          <FortifiedFoodIcon />
        </SourceCell>
        <SourceCell
          x={ix(3).x}
          y={ix(3).y}
          size={LAYOUT.cellSize}
          from={ix(0)}
          progress={pop(CUE.cellsIn[2])}
          opacity={1 - sourcesOut}
        >
          <SupplementIcon />
        </SourceCell>

        {/* Scene 9: main treatment, larger than the supportive sun. */}
        <TreatmentIcon
          x={LAYOUT.treatment.x}
          y={LAYOUT.treatment.y}
          scale={
            LAYOUT.treatment.scale *
            sp(CUE.treatmentIn, { damping: 13, stiffness: 120 })
          }
          opacity={1}
        />

        <VitaminDIcon
          id="p2-sun"
          x={c.sun.x}
          y={c.sun.y}
          size={c.sun.size}
          spin={c.sun.spin}
          glow={c.sun.glow}
          onLight={c.sun.onLight}
        />
      </svg>

      {/* ---------- Labels inside diagrams ---------- */}
      <ArLabel
        x={LAYOUT.boneNerve.x}
        y={LAYOUT.boneNerve.y + 70}
        text="ومفيد لمرضى الـMS"
        size={44}
        progress={sp(CUE.msLabelIn)}
        opacity={1 - prog(CUE.toTest, CUE.toTest + 0.3)}
      />
      <ArLabel
        x={LAYOUT.meter.lowX}
        y={LAYOUT.meter.y + 46}
        text="منخفض"
        size={36}
        weight={700}
        progress={sp(CUE.lowMarker + 0.3)}
        opacity={between(CUE.lowMarker, CUE.toDaily, 0.01, 0.25)}
      />
      <ArLabel
        x={DECISION.testPill.x - 40}
        y={DECISION.testPill.y - 30}
        text="التحليل"
        size={40}
        weight={700}
        progress={sp(CUE.inputsIn + 0.15)}
        opacity={between(CUE.inputsIn, CUE.toDaily, 0.01, 0.25)}
      />
      <ArLabel
        x={DECISION.conditionPill.x - 40}
        y={DECISION.conditionPill.y - 30}
        text="الحالة"
        size={40}
        weight={700}
        progress={sp(CUE.inputsIn + 0.3)}
        opacity={between(CUE.inputsIn, CUE.toDaily, 0.01, 0.25)}
      />
      <ArLabel
        x={DECISION.node.x - 50}
        y={DECISION.node.y - 33}
        text="تحديد الجرعة"
        size={44}
        weight={700}
        color={BRAND.offWhite}
        progress={sp(CUE.doseNodeIn + 0.2)}
        opacity={between(CUE.doseNodeIn, CUE.toDaily, 0.01, 0.25)}
      />
      <ArLabel
        x={540}
        y={690}
        text="حوالي"
        size={42}
        progress={sp(CUE.numberIn)}
        opacity={1 - valueSwap}
      />
      <ArLabel
        x={MONITOR.doctor.x}
        y={MONITOR.doctor.y + 92}
        text="متابعة طبيب"
        size={38}
        weight={700}
        progress={sp(CUE.monitorIn + 0.15)}
        opacity={between(CUE.monitorIn, CUE.toCaution, 0.01, 0.3)}
      />
      <ArLabel
        x={MONITOR.tests.x}
        y={MONITOR.tests.y + 92}
        text="تحاليل"
        size={38}
        weight={700}
        progress={sp(CUE.monitorIn + 0.3)}
        opacity={between(CUE.monitorIn, CUE.toCaution, 0.01, 0.3)}
      />
      <ArLabel
        x={540}
        y={926}
        text="الكالسيوم"
        size={38}
        weight={700}
        progress={sp(CUE.calciumUp)}
        opacity={cautionOpacity}
      />
      <ArLabel
        x={720}
        y={1282}
        text="حصوات"
        size={40}
        weight={700}
        progress={sp(CUE.kidneysIn[0] + 0.15)}
        opacity={cautionOpacity}
      />
      <ArLabel
        x={360}
        y={1282}
        text="أذى للكلى"
        size={40}
        weight={700}
        progress={sp(CUE.kidneysIn[1] + 0.15)}
        opacity={cautionOpacity}
      />
      {(
        ["الشمس", "الأسماك الدهنية", "الأكل المدعّم", "المكمّلات"] as const
      ).map((label, i) => (
        <ArLabel
          key={label}
          x={ix(i).x}
          y={ix(i).y + 92}
          text={label}
          size={38}
          weight={700}
          progress={sp(
            (i === 0 ? CUE.toSourcesEnd : CUE.cellsIn[i - 1]) + 0.15,
          )}
          opacity={1 - sourcesOut}
        />
      ))}

      {/* ---------- Kinetic headlines, one Sequence per scene ---------- */}
      <Sequence
        name="1 · Bone health"
        from={f(SCENES.bones.start)}
        durationInFrames={f(SCENES.bones.end - SCENES.bones.start + TEXT_TAIL)}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title1In}
          outAt={SCENES.bones.end - 0.25}
          lines={[
            { text: "وبرضه فيتامين د", size: 54, weight: 600 },
            { text: "مهم جدًا لصحة العظام", size: 82 },
          ]}
        />
      </Sequence>
      <Sequence
        name="2 · Test first"
        from={f(SCENES.test.start)}
        durationInFrames={f(SCENES.test.end - SCENES.test.start + TEXT_TAIL)}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title2In}
          outAt={SCENES.test.end - 0.25}
          lines={[
            { text: "أول خطوة الصح", size: 86 },
            { text: "تقيس المستوى في الدم", size: 54, weight: 600 },
          ]}
        />
      </Sequence>
      <Sequence
        name="3 · Personalized dose"
        from={f(SCENES.decision.start)}
        durationInFrames={f(
          SCENES.decision.end - SCENES.decision.start + TEXT_TAIL,
        )}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title3In}
          outAt={SCENES.decision.end - 0.25}
          lines={[
            { text: "لو المستوى منخفض", size: 82 },
            { text: "الجرعة حسب التحليل والحالة", size: 54, weight: 600 },
          ]}
        />
      </Sequence>
      <Sequence
        name="4 · Daily need 600–800"
        from={f(SCENES.daily.start)}
        durationInFrames={f(SCENES.daily.end - SCENES.daily.start + TEXT_TAIL)}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title4In}
          outAt={SCENES.daily.end - 0.25}
          lines={[
            { text: "للبالغين عمومًا", size: 54, weight: 600 },
            { text: "الاحتياج اليومي المعتاد", size: 78 },
          ]}
        />
      </Sequence>
      <Sequence
        name="5 · Upper safe limit 4000"
        from={f(SCENES.limit.start)}
        durationInFrames={f(SCENES.limit.end - SCENES.limit.start + TEXT_TAIL)}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title5In}
          outAt={SCENES.limit.end - 0.25}
          lines={[
            { text: "الحد الأعلى الآمن", size: 84 },
            { text: "غالبًا، من غير إشراف طبي", size: 54, weight: 600 },
          ]}
        />
      </Sequence>
      <Sequence
        name="6 · Medical supervision"
        from={f(SCENES.supervision.start)}
        durationInFrames={f(
          SCENES.supervision.end - SCENES.supervision.start + TEXT_TAIL,
        )}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title6In}
          outAt={SCENES.supervision.end - 0.25}
          lines={[
            { text: "لو الجرعات هتزيد عن كده", size: 54, weight: 600 },
            { text: "لازم متابعة طبيب وتحاليل", size: 76 },
          ]}
        />
      </Sequence>
      <Sequence
        name="7 · Too much can harm"
        from={f(SCENES.caution.start)}
        durationInFrames={f(
          SCENES.caution.end - SCENES.caution.start + TEXT_TAIL,
        )}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title7In}
          outAt={SCENES.caution.end - 0.25}
          lines={[
            { text: "الزيادة ممكن ترفع الكالسيوم", size: 64 },
            { text: "وتسبب حصوات أو أذى للكلى", size: 52, weight: 600 },
          ]}
        />
      </Sequence>
      <Sequence
        name="8 · Best sources"
        from={f(SCENES.sources.start)}
        durationInFrames={f(
          SCENES.sources.end - SCENES.sources.start + TEXT_TAIL,
        )}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop + 20}
          inAt={CUE.title8In}
          outAt={SCENES.sources.end - 0.25}
          lines={[{ text: "أفضل مصادره", size: 90 }]}
        />
      </Sequence>
      <Sequence
        name="9 · Support, not a replacement"
        from={f(SCENES.summary.start)}
        durationInFrames={f(SCENES.summary.end - SCENES.summary.start)}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title9In}
          lines={[
            { text: "عامل دعم مهم", size: 84 },
            { text: "لكن مش بديل عن علاجك", size: 56, weight: 600 },
          ]}
        />
        <div
          dir="rtl"
          style={{
            position: "absolute",
            top: 1300,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <Chip
            relation="="
            word="دعم"
            variant="yes"
            progress={pop(CUE.chipsIn[0])}
          />
          <Chip
            relation="≠"
            word="بديل"
            variant="no"
            progress={pop(CUE.chipsIn[1])}
          />
        </div>
      </Sequence>

      <FilmGrain frame={frame} width={width} height={height} />

      {/* ---------- Subtle SFX (same set as Part 1; no music, no voice) ---------- */}
      {TRANSITIONS.map((t, i) => (
        <Audio
          key={`whoosh-${i}`}
          name={`Whoosh ${i + 1}`}
          src={staticFile("audio/whoosh.mp3")}
          from={f(t.at - 0.2)}
          premountFor={fps}
          volume={0.22}
        />
      ))}
      {[
        CUE.boneDrawEnd - 0.2,
        CUE.crossWall + 0.4,
        CUE.calciumUp,
        CUE.nerveRedrawEnd - 0.2,
      ].map((at, i) => (
        <Audio
          key={`pulse-${i}`}
          name={`Pulse ${i + 1}`}
          src={staticFile("audio/pulse.mp3")}
          from={f(at)}
          premountFor={fps}
          volume={0.28}
        />
      ))}
      {[
        CUE.stepBadgeIn,
        CUE.inputsIn,
        CUE.doseNodeIn,
        CUE.rangeIn,
        CUE.wallIn + 0.4,
        CUE.monitorIn,
        ...CUE.kidneysIn,
        ...CUE.cellsIn,
        ...CUE.chipsIn,
      ].map((at, i) => (
        <Audio
          key={`click-${i}`}
          name={`Click ${i + 1}`}
          src={staticFile("audio/click.mp3")}
          from={f(at + 0.05)}
          premountFor={fps}
          volume={0.26}
        />
      ))}
    </AbsoluteFill>
  );
};
