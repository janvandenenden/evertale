import { PDFDocument, PDFPage } from "pdf-lib";
import { PAGE_WIDTH_PT, PAGE_HEIGHT_PT, imageDrawLayout } from "./constants";

/**
 * Renders a scene illustration as a full-bleed page in the PDF.
 * The image is scaled to fill the page width and centered vertically.
 */
export async function renderScenePage(
  pdfDoc: PDFDocument,
  imageBytes: Uint8Array,
  contentType: string
): Promise<PDFPage> {
  const image =
    contentType === "image/png"
      ? await pdfDoc.embedPng(imageBytes)
      : await pdfDoc.embedJpg(imageBytes);

  const page = pdfDoc.addPage([PAGE_WIDTH_PT, PAGE_HEIGHT_PT]);
  const { drawWidth, drawHeight, offsetX, offsetY } = imageDrawLayout();

  page.drawImage(image, {
    x: offsetX,
    y: offsetY,
    width: drawWidth,
    height: drawHeight,
  });

  return page;
}
