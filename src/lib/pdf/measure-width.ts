import type { PDFFont } from "pdf-lib";
import type { MeasureWidth } from "@/lib/text-pages/fit-text";

/**
 * Creates a MeasureWidth function backed by pdf-lib's PDFFont.
 * This plugs directly into the existing fitText() / wrapText() algorithms.
 *
 * Note: the fontFamily parameter in MeasureWidth is ignored here because
 * the PDFFont already encodes the family. The caller must pass the correct
 * PDFFont for the template's font family.
 */
export function createPdfLibMeasureWidth(font: PDFFont): MeasureWidth {
  return (text: string, fontSize: number, _fontFamily: string) =>
    font.widthOfTextAtSize(text, fontSize);
}
