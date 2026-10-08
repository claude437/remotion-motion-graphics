#!/usr/bin/env node
/**
 * Scaffolds a new composition and registers it in src/Root.tsx.
 *
 *   npm run new -- ProductLaunch
 *   npm run new -- ProductLaunch --seconds=8
 *
 * Creates src/compositions/<Name>.tsx using the shared Background and
 * AnimatedText components, then adds an import and a <Composition> to Root.tsx
 * above the `new-compositions-go-above-this-line` marker.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const secondsArg = args.find((a) => a.startsWith("--seconds="));
const seconds = secondsArg ? Number(secondsArg.split("=")[1]) : 5;

const fail = (msg) => {
  console.error(`Error: ${msg}`);
  process.exit(1);
};

if (!name) fail("Pass a PascalCase name, e.g. `npm run new -- ProductLaunch`.");
if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  fail(
    `"${name}" must be PascalCase (letters and digits, starting uppercase).`,
  );
}
if (!Number.isFinite(seconds) || seconds <= 0)
  fail("--seconds must be a positive number.");

const compFile = path.join(root, "src", "compositions", `${name}.tsx`);
const rootFile = path.join(root, "src", "Root.tsx");
const marker = "{/* new-compositions-go-above-this-line */}";
const rootSource = readFileSync(rootFile, "utf8");

if (existsSync(compFile))
  fail(`${path.relative(root, compFile)} already exists.`);
if (rootSource.includes(`id="${name}"`))
  fail(`A composition with id "${name}" is already registered.`);
if (!rootSource.includes(marker))
  fail(`Marker ${marker} not found in src/Root.tsx.`);

const component = `import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Background } from "../components/Background";
import { THEME } from "../config/theme";
import { CLAMP, EASE } from "../lib/animation";

export const ${name}: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: THEME.font.family }}>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 32,
          padding: \`\${THEME.safeArea.y}px \${THEME.safeArea.x}px\`,
          opacity: interpolate(
            frame,
            [durationInFrames - 0.5 * fps, durationInFrames - 1],
            [1, 0],
            { ...CLAMP, easing: EASE.in },
          ),
        }}
      >
        <AnimatedText
          text="${name.replace(/([a-z0-9])([A-Z])/g, "$1 $2")}"
          delay={0.2 * fps}
          style={{
            fontSize: THEME.font.headline,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: THEME.colors.text,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
`;

const registration = `<Composition
        id="${name}"
        component={${name}}
        width={VIDEO.width}
        height={VIDEO.height}
        fps={VIDEO.fps}
        durationInFrames={sec(${seconds}, VIDEO.fps)}
      />

      ${marker}`;

const importLine = `import { ${name} } from "./compositions/${name}";\n`;
const lastImport = rootSource.lastIndexOf("\nimport ");
const afterLastImport = rootSource.indexOf("\n", lastImport + 1) + 1;

const nextRoot = (
  rootSource.slice(0, afterLastImport) +
  importLine +
  rootSource.slice(afterLastImport)
).replace(marker, registration);

writeFileSync(compFile, component);
writeFileSync(rootFile, nextRoot);

console.log(
  `Created src/compositions/${name}.tsx (${seconds}s) and registered it in src/Root.tsx.`,
);
console.log(`Preview:  npm run dev   (select "${name}" in the sidebar)`);
console.log(`Render:   npx remotion render ${name} out/${name}.mp4`);
