import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Same MS Fighter palette as the Vitamin D videos: one brand system.
export { BRAND } from "../vitamin-d-ms/theme";

/**
 * Cairo (SIL OFL 1.1), bundled in public/fonts/cairo so Arabic shaping is
 * identical in Studio and in headless renders. Arabic and Latin subsets share
 * one family name; unicodeRange picks the right file per character.
 */
export const CAIRO = "Cairo";

const ARABIC_RANGE =
  "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC";
const LATIN_RANGE =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";

for (const weight of ["600", "700", "800"] as const) {
  for (const [subset, unicodeRange] of [
    ["arabic", ARABIC_RANGE],
    ["latin", LATIN_RANGE],
  ] as const) {
    loadFont({
      family: CAIRO,
      url: staticFile(`fonts/cairo/cairo-${subset}-${weight}-normal.woff2`),
      weight,
      unicodeRange,
    }).catch((err) => {
      console.error(`Failed to load ${CAIRO} ${subset} ${weight}`, err);
    });
  }
}
