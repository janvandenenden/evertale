import { PDFDocument, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Maps font family names (as used in TextPageTemplate) to .ttf file names
 * in src/assets/fonts/.
 */
const FONT_FILE_MAP: Record<string, string> = {
  Nunito: "Nunito-Regular.ttf",
  Lora: "Lora-Regular.ttf",
};

const fontsDir = join(process.cwd(), "src", "assets", "fonts");

/**
 * Register fontkit on a PDFDocument (required for custom font embedding).
 * Safe to call multiple times -- fontkit is idempotent.
 */
export function registerFontkit(pdfDoc: PDFDocument): void {
  pdfDoc.registerFontkit(fontkit);
}

/**
 * Embed a font into the PDF document by family name.
 * Reads the .ttf file from src/assets/fonts/ and embeds it.
 */
export async function embedFont(
  pdfDoc: PDFDocument,
  fontFamily: string
): Promise<PDFFont> {
  const fileName = FONT_FILE_MAP[fontFamily];
  if (!fileName) {
    throw new Error(
      `Unknown font family "${fontFamily}". Add it to FONT_FILE_MAP in font-loader.ts`
    );
  }

  registerFontkit(pdfDoc);
  const fontPath = join(fontsDir, fileName);
  const fontBytes = await readFile(fontPath);
  return pdfDoc.embedFont(fontBytes);
}

/**
 * Embed all unique fonts referenced by templates.
 * Returns a map from font family name to embedded PDFFont.
 */
export async function embedFonts(
  pdfDoc: PDFDocument,
  fontFamilies: readonly string[]
): Promise<Map<string, PDFFont>> {
  const unique = [...new Set(fontFamilies)];
  const map = new Map<string, PDFFont>();

  for (const family of unique) {
    const font = await embedFont(pdfDoc, family);
    map.set(family, font);
  }

  return map;
}
