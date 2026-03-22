/**
 * Maps template font family names to CSS font-family values.
 *
 * Template configs use generic names like "serif". This resolves them
 * to the actual loaded font so canvas measurement and CSS rendering
 * match the PDF output (which embeds the real font file).
 */
const CSS_FONT_FAMILY_MAP: Record<string, string> = {
  serif: "var(--font-lora), Lora, serif",
  Lora: "var(--font-lora), Lora, serif",
  Nunito: "Nunito, sans-serif",
};

export function resolveCssFontFamily(templateFamily: string): string {
  return CSS_FONT_FAMILY_MAP[templateFamily] ?? templateFamily;
}

/**
 * Resolve font family for canvas measureText (no CSS variables).
 * Canvas needs the raw font name, not var(--font-lora).
 */
const CANVAS_FONT_FAMILY_MAP: Record<string, string> = {
  serif: "Lora, serif",
  Lora: "Lora, serif",
  Nunito: "Nunito, sans-serif",
};

export function resolveCanvasFontFamily(templateFamily: string): string {
  return CANVAS_FONT_FAMILY_MAP[templateFamily] ?? templateFamily;
}
