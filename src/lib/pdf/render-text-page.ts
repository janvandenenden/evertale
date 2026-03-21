import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { PAGE_WIDTH_PT, PAGE_HEIGHT_PT, imageDrawLayout } from "./constants";
import { fitText } from "@/lib/text-pages/fit-text";
import { createPdfLibMeasureWidth } from "./measure-width";
import type { TextPageTemplate } from "@/lib/text-pages/types";

/**
 * Parse a hex color string (#RRGGBB) into pdf-lib rgb() values.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16) / 255,
    g: parseInt(clean.substring(2, 4), 16) / 255,
    b: parseInt(clean.substring(4, 6), 16) / 255,
  };
}

/**
 * Renders a text page: background image (full bleed) with fitted text overlay.
 *
 * Text box coordinates from the template are percentages of the source image
 * (5:4 ratio). We map them to the image's drawn position on the page.
 *
 * Font sizes from the template are in pixels relative to the source image's
 * natural width. We scale them to PDF points using the ratio of the drawn
 * width to a reference image width.
 */
export async function renderTextPage(
  pdfDoc: PDFDocument,
  backgroundBytes: Uint8Array,
  contentType: string,
  text: string,
  template: TextPageTemplate,
  font: PDFFont,
  imageNaturalWidth: number
): Promise<PDFPage> {
  // Embed and draw background image
  const bgImage =
    contentType === "image/png"
      ? await pdfDoc.embedPng(backgroundBytes)
      : await pdfDoc.embedJpg(backgroundBytes);

  const page = pdfDoc.addPage([PAGE_WIDTH_PT, PAGE_HEIGHT_PT]);
  const layout = imageDrawLayout();

  page.drawImage(bgImage, {
    x: layout.offsetX,
    y: layout.offsetY,
    width: layout.drawWidth,
    height: layout.drawHeight,
  });

  // Scale factor: template font sizes (px) -> PDF points
  const scaleFactor = layout.drawWidth / imageNaturalWidth;

  // Convert text box percentages to PDF coordinates
  // Percentages are relative to the image, so map to drawn image area
  const boxX = layout.offsetX + template.textBox.xPct * layout.drawWidth;
  const boxW = template.textBox.wPct * layout.drawWidth;
  const boxH = template.textBox.hPct * layout.drawHeight;

  // pdf-lib uses bottom-left origin. The image's top is at
  // (layout.offsetY + layout.drawHeight). The text box top in image coords is
  // yPct from the top of the image.
  const boxTopY =
    layout.offsetY + layout.drawHeight * (1 - template.textBox.yPct);
  const boxBottomY = boxTopY - boxH;

  // Scale font config for PDF
  const scaledFont = {
    ...template.font,
    minSize: Math.round(template.font.minSize * scaleFactor),
    maxSize: Math.round(template.font.maxSize * scaleFactor),
  };

  // Fit text into the box
  const measureWidth = createPdfLibMeasureWidth(font);
  const { fontSize, lines } = fitText(
    text,
    boxW,
    boxH,
    scaledFont,
    template.maxLines,
    measureWidth
  );

  // Calculate vertical position based on valign
  const lineHeightPt = fontSize * template.font.lineHeight;
  const totalTextHeight = lines.length * lineHeightPt;

  let startY: number;
  switch (template.valign) {
    case "top":
      startY = boxTopY - lineHeightPt;
      break;
    case "bottom":
      startY = boxBottomY + totalTextHeight - lineHeightPt;
      break;
    case "center":
    default:
      startY = boxTopY - (boxH - totalTextHeight) / 2 - lineHeightPt;
      break;
  }

  // Draw each line
  const color = hexToRgb(template.font.color);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineY = startY - i * lineHeightPt;

    // Calculate x position based on align
    let lineX: number;
    const lineWidth = font.widthOfTextAtSize(line, fontSize);

    switch (template.align) {
      case "right":
        lineX = boxX + boxW - lineWidth;
        break;
      case "center":
        lineX = boxX + (boxW - lineWidth) / 2;
        break;
      case "left":
      default:
        lineX = boxX;
        break;
    }

    page.drawText(line, {
      x: lineX,
      y: lineY,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
    });
  }

  return page;
}
