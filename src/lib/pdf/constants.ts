/**
 * Lulu print specifications for US Letter Landscape.
 * All values in inches -- update here if Lulu requirements change.
 */
export const LULU_SPECS = {
  trimWidthIn: 11,
  trimHeightIn: 8.5,
  bleedIn: 0.125,
  safeMarginIn: 0.5,
} as const;

/** Points per inch (PDF standard). */
const PPI = 72;

/** Trim area in points. */
export const TRIM_WIDTH_PT = LULU_SPECS.trimWidthIn * PPI; // 792
export const TRIM_HEIGHT_PT = LULU_SPECS.trimHeightIn * PPI; // 612

/** Bleed in points. */
export const BLEED_PT = LULU_SPECS.bleedIn * PPI; // 9

/** Full page size including bleed on all sides. */
export const PAGE_WIDTH_PT = TRIM_WIDTH_PT + 2 * BLEED_PT; // 810
export const PAGE_HEIGHT_PT = TRIM_HEIGHT_PT + 2 * BLEED_PT; // 630

/** Safe zone inset from trim edge (for text content). */
export const SAFE_MARGIN_PT = LULU_SPECS.safeMarginIn * PPI; // 36

/**
 * Source images are 5:4 ratio. The page is 11:8.5 (~1.294:1).
 * We scale images to fill page width and center vertically,
 * cropping a small amount off top/bottom (~3.5%).
 */
export const SOURCE_IMAGE_ASPECT = 5 / 4; // 1.25

/**
 * Compute the draw dimensions and offset for a 5:4 image
 * filling a page of PAGE_WIDTH_PT x PAGE_HEIGHT_PT.
 *
 * Returns the y-offset (negative, since the image is taller than the page
 * at full width) and the drawn height.
 */
/**
 * Lulu POD Package ID for the final book:
 * 11x8.5 in, Full Color, Premium, Casewrap (hardcover), 80# Coated White, Matte, no linen, no foil.
 */
export const LULU_POD_PACKAGE_ID = "1100X0850.FC.PRE.CO.080CW444.MXX";

/** Total interior pages: 27 scenes + 27 text pages. */
export const INTERIOR_PAGE_COUNT = 54;

export function imageDrawLayout(): {
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
} {
  const drawWidth = PAGE_WIDTH_PT;
  const drawHeight = drawWidth / SOURCE_IMAGE_ASPECT; // taller than PAGE_HEIGHT_PT
  const offsetX = 0;
  const offsetY = (PAGE_HEIGHT_PT - drawHeight) / 2; // negative: centers vertically
  return { drawWidth, drawHeight, offsetX, offsetY };
}
