import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  interpolateColors,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CLAMP, EASE, track } from "../../lib/animation";
import { useChoreography } from "./choreography";
import { AssociationGraph } from "./components/AssociationGraph";
import { BrandBackground } from "./components/BrandBackground";
import { Chip } from "./components/Chip";
import { ComparisonBars } from "./components/ComparisonBars";
import { FilmGrain } from "./components/FilmGrain";
import { ImmuneCells } from "./components/ImmuneCells";
import { KineticText } from "./components/KineticText";
import { MRIScan } from "./components/MRIScan";
import { NerveMyelin } from "./components/NerveMyelin";
import { ResearchCard } from "./components/ResearchCard";
import { SceneTransition } from "./components/SceneTransition";
import { TreatmentIcon } from "./components/TreatmentIcon";
import { VitaminDIcon } from "./components/VitaminDIcon";
import { ARABIC_FONT, BRAND } from "./theme";
import { CUE, LAYOUT, SCENES, TRANSITIONS } from "./timeline";

/** Scene typography stays mounted this long (s) past its scene so exits can finish. */
const TEXT_TAIL = 0.5;

/**
 * "Vitamin D & MS" — 16 s vertical explainer (1080×1920, 60 fps).
 *
 * One continuous motion sequence: the sun, the nerve, the data dots / immune
 * cells and a single morphing panel persist across all six scenes and
 * transform into each other (see choreography.ts). Scene-specific typography
 * is mounted per scene in <Sequence>s. All timing lives in timeline.ts.
 */
export const VitaminDMS: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const c = useChoreography(frame, fps);
  const f = (s: number) => Math.round(s * fps);
  const between = (a: number, b: number, fadeIn = 0.3, fadeOut = 0.3) =>
    interpolate(c.sec, [a, a + fadeIn, b, b + fadeOut], [0, 1, 1, 0], CLAMP);

  const graphOpacity = between(CUE.toGraph + 0.2, CUE.toCells, 0.2, 0.45);
  const axisDraw = interpolate(c.sec, [CUE.axisIn, CUE.axisIn + 0.45], [0, 1], {
    ...CLAMP,
    easing: EASE.out,
  });
  const connector =
    between(CUE.connectorIn, CUE.toGraph - 0.05, 0.4, 0.25) +
    interpolate(
      c.sec,
      [CUE.finaleEnd - 0.2, CUE.finaleEnd + 0.3],
      [0, 1],
      CLAMP,
    );
  const signals = between(CUE.regulationStart, CUE.cellsMerge - 0.2, 0.35, 0.3);
  const mriOpacity = between(CUE.brainDraw - 0.05, CUE.toBars, 0.2, 0.25);
  const studyOut = interpolate(c.sec, [CUE.toBars, CUE.toBars + 0.3], [1, 0], {
    ...CLAMP,
    easing: EASE.in,
  });
  // Swap the panel color in the middle of its morph so it never sits in a muddy gray.
  const panelFill = interpolateColors(
    c.panel.dark,
    [0.35, 0.65],
    [BRAND.offWhite, BRAND.charcoal],
  );

  return (
    <AbsoluteFill
      style={{ backgroundColor: BRAND.orange, fontFamily: ARABIC_FONT }}
    >
      <BrandBackground frame={frame} fps={fps} width={width} height={height} />

      {/* ---------- Vector stage: persistent, morphing objects ---------- */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute" }}
      >
        <defs>
          <filter
            id="panel-shadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="150%"
          >
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

        <AssociationGraph
          axis={axisDraw}
          draw={c.lineDraw}
          opacity={graphOpacity}
        />

        {/* Support link: Vitamin D → nerve (scene 1 and final frame). */}
        {connector > 0 ? (
          <path
            d={`M ${LAYOUT.sunSupport.x} ${LAYOUT.sunSupport.y + 104} C ${LAYOUT.sunSupport.x} ${LAYOUT.nerveHero.y - 110}, ${LAYOUT.sunSupport.x + 40} ${LAYOUT.nerveHero.y - 60}, ${LAYOUT.sunSupport.x + 70} ${LAYOUT.nerveHero.y - 34}`}
            fill="none"
            stroke={BRAND.charcoal}
            strokeWidth={5}
            strokeDasharray="4 16"
            strokeLinecap="round"
            strokeDashoffset={-c.sec * 40}
            opacity={0.75 * Math.min(1, connector)}
          />
        ) : null}

        <NerveMyelin {...c.nerve} />

        {/* Regulatory signal: dashed links from the sun to every cell. */}
        {signals > 0
          ? c.cells.map((cell, i) => (
              <line
                key={i}
                x1={c.sun.x}
                y1={c.sun.y}
                x2={cell.x}
                y2={cell.y}
                stroke={BRAND.offWhite}
                strokeWidth={4}
                strokeDasharray="3 14"
                strokeLinecap="round"
                strokeDashoffset={-c.sec * 50}
                opacity={0.8 * signals}
              />
            ))
          : null}
        {CUE.pulses.map((p) => {
          const t = interpolate(c.sec, [p, p + 0.9], [0, 1], {
            ...CLAMP,
            easing: EASE.out,
          });
          if (t <= 0 || t >= 1) return null;
          return (
            <circle
              key={p}
              cx={c.sun.x}
              cy={c.sun.y}
              r={90 + 260 * t}
              fill="none"
              stroke={BRAND.offWhite}
              strokeWidth={6 * (1 - t) + 1}
              opacity={0.6 * (1 - t)}
            />
          );
        })}

        <ImmuneCells cells={c.cells} />

        {/* Morphing panel */}
        {c.panel.w > 1 && c.panel.h > 1 && c.panel.opacity > 0 ? (
          <rect
            x={c.panel.x - c.panel.w / 2}
            y={c.panel.y - c.panel.h / 2}
            width={c.panel.w}
            height={c.panel.h}
            rx={Math.min(c.panel.radius, c.panel.h / 2)}
            fill={panelFill}
            opacity={c.panel.opacity}
            filter="url(#panel-shadow)"
          />
        ) : null}

        <TreatmentIcon
          x={LAYOUT.card.x}
          y={LAYOUT.card.y - 50}
          scale={0.82 * c.sp(CUE.cardIn + 0.2, { damping: 13, stiffness: 120 })}
          opacity={interpolate(
            c.sec,
            [CUE.toMri, CUE.toMri + 0.25],
            [1, 0],
            CLAMP,
          )}
        />

        <MRIScan
          x={LAYOUT.mri.x}
          y={LAYOUT.mri.y}
          w={LAYOUT.mri.w}
          h={LAYOUT.mri.h}
          draw={interpolate(c.sec, [CUE.brainDraw, CUE.brainDrawEnd], [0, 1], {
            ...CLAMP,
            easing: EASE.inOut,
          })}
          scan={interpolate(c.sec, [CUE.scan, CUE.scanEnd], [0, 1], {
            ...CLAMP,
            easing: EASE.inOut,
          })}
          improve={interpolate(c.sec, [CUE.improve, CUE.improveEnd], [0, 1], {
            ...CLAMP,
            easing: EASE.inOut,
          })}
          opacity={mriOpacity}
        />

        {CUE.studyCards.map((at, i) => (
          <ResearchCard
            key={at}
            x={[770, 540, 310][i]}
            y={1345 + 90 * (1 - studyOut)}
            rotation={[4, 0, -4][i]}
            sample={[4, 5, 3][i]}
            progress={c.sp(at, { damping: 14, stiffness: 140 })}
            opacity={studyOut}
          />
        ))}

        <ComparisonBars
          base={LAYOUT.bars.base}
          maxHeight={LAYOUT.bars.maxHeight}
          width={LAYOUT.bars.width}
          x5000={LAYOUT.bars.x5000}
          x600={LAYOUT.bars.x600}
          grow5000={c.grow5000}
          grow600={c.grow600}
          level={interpolate(
            c.sec,
            [CUE.levelLineIn, CUE.levelLineIn + 0.5],
            [0, 1],
            CLAMP,
          )}
          relapse={interpolate(c.sec, [CUE.relapseIn, CUE.relapseEnd], [0, 1], {
            ...CLAMP,
            easing: EASE.inOut,
          })}
          opacity={between(CUE.toBarsEnd - 0.1, CUE.finale, 0.25, 0.35)}
        />

        <VitaminDIcon
          id="vd-small"
          x={c.smallSun.x}
          y={c.smallSun.y}
          size={c.smallSun.size}
          spin={c.sun.spin}
          glow={0.3}
          opacity={c.smallSun.opacity}
        />
        <VitaminDIcon
          id="vd-main"
          x={c.sun.x}
          y={c.sun.y}
          size={c.sun.size}
          rays={c.sun.rays}
          spin={c.sun.spin}
          glow={c.sun.glow}
        />
      </svg>

      {/* ---------- Typography, one Sequence per scene ---------- */}
      <Sequence
        name="1 · Vitamin D: important, not a cure"
        from={f(SCENES.vitaminD.start)}
        durationInFrames={f(
          SCENES.vitaminD.end - SCENES.vitaminD.start + TEXT_TAIL,
        )}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title1In}
          outAt={CUE.title1Out}
          lines={[
            { text: "فيتامين د", size: 104 },
            { text: "مهم لمرضى التصلب المتعدد", size: 56, weight: 600 },
          ]}
        />
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop + 30}
          inAt={CUE.notMagicIn}
          outAt={SCENES.vitaminD.end - 0.1}
          lines={[{ text: "لكن مش علاج سحري", size: 80 }]}
        />
      </Sequence>

      <Sequence
        name="2 · Association"
        from={f(SCENES.association.start)}
        durationInFrames={f(
          SCENES.association.end - SCENES.association.start + TEXT_TAIL,
        )}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title2In}
          outAt={SCENES.association.end - 0.25}
          lines={[
            { text: "نقص فيتامين د", size: 84 },
            { text: "مرتبط بزيادة نشاط الـMS", size: 56, weight: 600 },
          ]}
        />
        <Legend frame={frame} fps={fps} />
      </Sequence>

      <Sequence
        name="3 · Immune regulation"
        from={f(SCENES.immune.start)}
        durationInFrames={f(
          SCENES.immune.end - SCENES.immune.start + TEXT_TAIL,
        )}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title3In}
          outAt={SCENES.immune.end - 0.25}
          lines={[
            { text: "فيتامين د له دور في", size: 56, weight: 600 },
            { text: "تنظيم جهاز المناعة", size: 84 },
          ]}
        />
      </Sequence>

      <Sequence
        name="4 · Support, not replacement"
        from={f(SCENES.treatment.start)}
        durationInFrames={f(
          SCENES.treatment.end - SCENES.treatment.start + TEXT_TAIL,
        )}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop + 20}
          inAt={CUE.title4In}
          outAt={SCENES.treatment.end - 0.25}
          lines={[{ text: "ما فيش دليل إنه بديل", size: 80 }]}
        />
        <div
          dir="rtl"
          style={{
            position: "absolute",
            top: LAYOUT.card.y + 128,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 46,
            fontWeight: 700,
            color: BRAND.charcoal,
            opacity:
              c.sp(CUE.cardIn + 0.35) *
              interpolate(c.sec, [CUE.toMri, CUE.toMri + 0.2], [1, 0], CLAMP),
          }}
        >
          العلاج الأساسي
        </div>
        <div
          dir="rtl"
          style={{
            position: "absolute",
            top: 1330,
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
            progress={c.sp(CUE.chipSupportIn, { damping: 14, stiffness: 160 })}
            opacity={interpolate(
              c.sec,
              [CUE.toMri, CUE.toMri + 0.25],
              [1, 0],
              CLAMP,
            )}
          />
          <Chip
            relation="≠"
            word="بديل"
            variant="no"
            progress={c.sp(CUE.chipReplaceIn, { damping: 14, stiffness: 160 })}
            opacity={interpolate(
              c.sec,
              [CUE.toMri, CUE.toMri + 0.25],
              [1, 0],
              CLAMP,
            )}
          />
        </div>
      </Sequence>

      <Sequence
        name="5 · Small MRI studies"
        from={f(SCENES.mri.start)}
        durationInFrames={f(SCENES.mri.end - SCENES.mri.start + TEXT_TAIL)}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title5In}
          outAt={SCENES.mri.end - 0.25}
          lines={[
            { text: "دراسات صغيرة", size: 84 },
            { text: "تحسّن في بعض نتائج الرنين", size: 54, weight: 600 },
          ]}
        />
      </Sequence>

      <Sequence
        name="6 · 5000 IU vs 600 IU/day"
        from={f(SCENES.dose.start)}
        durationInFrames={f(SCENES.dose.end - SCENES.dose.start)}
        layout="none"
      >
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop}
          inAt={CUE.title6In}
          outAt={CUE.finale - 0.15}
          lines={[
            { text: "أكبر دراسة مشهورة", size: 48, weight: 600 },
            { text: "5000 ما كانتش أحسن من 600", size: 62 },
          ]}
        />
        <div
          dir="rtl"
          style={{
            position: "absolute",
            top: LAYOUT.bars.base + 106,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 42,
            fontWeight: 600,
            color: BRAND.charcoal,
            opacity: between(CUE.relapseIn, CUE.finale, 0.3, 0.3),
          }}
        >
          تقليل الانتكاسات
        </div>
        <KineticText
          frame={frame}
          fps={fps}
          top={LAYOUT.textTop + 30}
          inAt={CUE.finalTextIn}
          lines={[{ text: "دعم… مش علاج سحري", size: 76 }]}
        />
      </Sequence>

      <FilmGrain frame={frame} width={width} height={height} />

      {/* ---------- Subtle motion-design SFX (no music, no voice) ---------- */}
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
      <Audio
        name="Sun pulse"
        src={staticFile("audio/pulse.mp3")}
        from={f(CUE.sunIn)}
        premountFor={fps}
        volume={0.35}
      />
      {CUE.pulses.map((p, i) => (
        <Audio
          key={`pulse-${i}`}
          name={`Regulation pulse ${i + 1}`}
          src={staticFile("audio/pulse.mp3")}
          from={f(p)}
          premountFor={fps}
          volume={0.3 - i * 0.06}
        />
      ))}
      {[
        CUE.chipSupportIn,
        CUE.chipReplaceIn,
        ...CUE.studyCards,
        CUE.levelLineIn + 0.25,
      ].map((at, i) => (
        <Audio
          key={`click-${i}`}
          name={`Click ${i + 1}`}
          src={staticFile("audio/click.mp3")}
          from={f(at + 0.05)}
          premountFor={fps}
          volume={0.28}
        />
      ))}
      <Audio
        name="Final pulse"
        src={staticFile("audio/pulse.mp3")}
        from={f(CUE.finaleEnd - 0.3)}
        premountFor={fps}
        volume={0.25}
      />
    </AbsoluteFill>
  );
};

/** Scene 2 legend: color swatches for the two trend lines. */
const Legend: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = track(frame, fps, [
    [CUE.legendIn, 0],
    [CUE.legendIn + 0.4, 1],
    [SCENES.immune.start, 1],
    [SCENES.immune.start + 0.3, 0],
  ]);
  if (p <= 0) return null;
  const item = (label: string, color: string, thick: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          width: 46,
          height: thick,
          borderRadius: thick,
          backgroundColor: color,
        }}
      />
      <span>{label}</span>
    </div>
  );
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 568,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 70,
        fontSize: 40,
        fontWeight: 600,
        color: BRAND.charcoal,
        opacity: p,
        translate: `0 ${interpolate(p, [0, 1], [16, 0])}px`,
      }}
    >
      {item("فيتامين د ↓", BRAND.offWhite, 10)}
      {item("نشاط الـMS ↑", BRAND.charcoal, 7)}
    </div>
  );
};
