/** Points per inch (PDF standard). */
const PPI = 72;

// ---------------------------------------------------------------------------
// Book configuration
//
// All Lulu print specs live here. To set up a different book (size, binding,
// paper, page count), update this section and download a fresh cover template
// from Lulu to confirm the cover dimensions.
// ---------------------------------------------------------------------------

/**
 * Lulu POD Package ID for the final book.
 * Format: {size}.{color}.{quality}.{binding}.{paper}.{finish}
 * Current: 11x8.5 in, Full Color, Premium, Casewrap (hardcover),
 *          80# Coated White, Matte, no linen, no foil.
 */
export const LULU_POD_PACKAGE_ID = "1100X0850.FC.PRE.CO.080CW444.MXX";

/** Total interior pages (must be even). */
export const INTERIOR_PAGE_COUNT = 54;

/**
 * Interior page specs (US Letter Landscape).
 * These define the trim size of each interior page -- NOT the cover panels.
 */
export const LULU_SPECS = {
  trimWidthIn: 11,
  trimHeightIn: 8.5,
  bleedIn: 0.125,
  safeMarginIn: 0.5,
} as const;

/**
 * Cover spread dimensions from Lulu's cover template.
 *
 * For casewrap hardcover the cover panels are larger than interior pages
 * because the material wraps around case boards. These values come from
 * Lulu's "Upload Your Cover" requirements for the specific POD package
 * and page count above. The sandbox cover-dimensions API returns incorrect
 * values for casewrap, so we use the known-correct numbers here.
 *
 * To get updated values: upload your interior PDF on Lulu, go to the
 * cover step, and note the required Dimensions and Spine Width.
 */
export const COVER_SPECS = {
  widthIn: 24,
  heightIn: 10.25,
  spineWidthIn: 0.25,
} as const;

// ---------------------------------------------------------------------------
// Derived constants (in PDF points) -- computed from the specs above.
// Do not edit these directly; change the spec objects instead.
// ---------------------------------------------------------------------------

/** Interior trim area in points. */
export const TRIM_WIDTH_PT = LULU_SPECS.trimWidthIn * PPI;
export const TRIM_HEIGHT_PT = LULU_SPECS.trimHeightIn * PPI;

/** Bleed in points (applies to both interior pages and cover). */
export const BLEED_PT = LULU_SPECS.bleedIn * PPI;

/** Full interior page size including bleed on all sides. */
export const PAGE_WIDTH_PT = TRIM_WIDTH_PT + 2 * BLEED_PT;
export const PAGE_HEIGHT_PT = TRIM_HEIGHT_PT + 2 * BLEED_PT;

/** Safe zone inset from trim edge (for text content). */
export const SAFE_MARGIN_PT = LULU_SPECS.safeMarginIn * PPI;

/** Cover spread dimensions in points. */
export const COVER_WIDTH_PT = COVER_SPECS.widthIn * PPI;
export const COVER_HEIGHT_PT = COVER_SPECS.heightIn * PPI;
export const COVER_SPINE_PT = COVER_SPECS.spineWidthIn * PPI;

/**
 * Source images are generated at 5:4 ratio.
 * Used for scaling/cropping when placing images on pages.
 */
export const SOURCE_IMAGE_ASPECT = 5 / 4;

/**
 * Compute the draw dimensions and offset for a 5:4 image
 * filling an interior page (PAGE_WIDTH_PT x PAGE_HEIGHT_PT).
 */
export function imageDrawLayout(): {
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
} {
  const drawWidth = PAGE_WIDTH_PT;
  const drawHeight = drawWidth / SOURCE_IMAGE_ASPECT;
  const offsetX = 0;
  const offsetY = (PAGE_HEIGHT_PT - drawHeight) / 2;
  return { drawWidth, drawHeight, offsetX, offsetY };
}
