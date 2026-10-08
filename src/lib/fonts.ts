import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Inter is bundled locally in public/fonts/inter (SIL Open Font License),
 * so previews and renders work offline. `loadFont()` delays rendering until
 * each weight is ready, so text never renders with a fallback font.
 */
export const FONT_FAMILY = "Inter";

const WEIGHTS = ["400", "500", "700", "800", "900"] as const;

for (const weight of WEIGHTS) {
  loadFont({
    family: FONT_FAMILY,
    url: staticFile(`fonts/inter/inter-latin-${weight}-normal.woff2`),
    weight,
  }).catch((err) => {
    console.error(`Failed to load ${FONT_FAMILY} ${weight}`, err);
  });
}
