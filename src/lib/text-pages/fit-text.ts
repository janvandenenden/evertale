import type { FontConfig } from "./types";

export type MeasureWidth = (
  text: string,
  fontSize: number,
  fontFamily: string
) => number;

/** Greedy word-wrap that returns an array of lines. */
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  measureWidth: MeasureWidth
): readonly string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${currentLine} ${words[i]}`;
    if (measureWidth(candidate, fontSize, fontFamily) <= maxWidth) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);

  return lines;
}

export interface FitTextResult {
  readonly fontSize: number;
  readonly lines: readonly string[];
}

/**
 * Binary search for the largest font size (between font.minSize and font.maxSize)
 * that fits `text` within the given box dimensions and line count.
 */
export function fitText(
  text: string,
  boxWidthPx: number,
  boxHeightPx: number,
  font: FontConfig,
  maxLines: number,
  measureWidth: MeasureWidth
): FitTextResult {
  const { family, minSize, maxSize, lineHeight } = font;

  const fits = (size: number): readonly string[] | null => {
    const lines = wrapText(text, boxWidthPx, size, family, measureWidth);
    if (lines.length > maxLines) return null;
    const totalHeight = lines.length * size * lineHeight;
    if (totalHeight > boxHeightPx) return null;
    return lines;
  };

  // Check if even the minimum size fits
  const minResult = fits(minSize);
  if (!minResult) {
    // Still return minimum size with wrapped lines for preview
    const lines = wrapText(text, boxWidthPx, minSize, family, measureWidth);
    return { fontSize: minSize, lines };
  }

  // Binary search for largest fitting size
  let lo = minSize;
  let hi = maxSize;
  let bestSize = minSize;
  let bestLines = minResult;

  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    const result = fits(mid);
    if (result) {
      bestSize = mid;
      bestLines = result;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return { fontSize: Math.round(bestSize), lines: bestLines };
}

/**
 * Canvas-based measureWidth for browser use.
 * Optionally accepts a font resolver to map template font names
 * (e.g. "serif") to actual loaded font names (e.g. "Lora").
 */
export function createCanvasMeasureWidth(
  resolveFont?: (family: string) => string
): MeasureWidth {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  return (text: string, fontSize: number, fontFamily: string) => {
    const resolved = resolveFont ? resolveFont(fontFamily) : fontFamily;
    ctx.font = `${fontSize}px ${resolved}`;
    return ctx.measureText(text).width;
  };
}
