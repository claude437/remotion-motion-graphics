import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/** MS Fighter brand palette. Do not introduce other hues. */
export const BRAND = {
  orange: "#F57C00",
  orangeBright: "#FF7A00",
  /** Subtle darker orange tones for depth (derived from the primary). */
  orangeDeep: "#E06A00",
  orangeShadow: "#C95E00",
  charcoal: "#252525",
  beige: "#E9C7A6",
  offWhite: "#F7F5F0",
  gray: "#D9D9D9",
} as const;

/**
 * IBM Plex Sans Arabic (SIL OFL 1.1) is bundled in public/fonts so Arabic
 * shaping renders identically in Studio and in headless rendering.
 * The Arabic and Latin subsets share one family name; `unicodeRange` makes
 * the browser pick the right file per character.
 */
export const ARABIC_FONT = "IBM Plex Sans Arabic";

const ARABIC_RANGE =
  "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC";
const LATIN_RANGE =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";

for (const weight of ["500", "600", "700"] as const) {
  for (const [subset, unicodeRange] of [
    ["arabic", ARABIC_RANGE],
    ["latin", LATIN_RANGE],
  ] as const) {
    loadFont({
      family: ARABIC_FONT,
      url: staticFile(
        `fonts/ibm-plex-sans-arabic/ibm-plex-sans-arabic-${subset}-${weight}-normal.woff2`,
      ),
      weight,
      unicodeRange,
    }).catch((err) => {
      console.error(`Failed to load ${ARABIC_FONT} ${subset} ${weight}`, err);
    });
  }
}
