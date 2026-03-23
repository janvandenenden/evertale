import { PDFDocument, rgb, degrees } from "pdf-lib";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { registerFontkit, embedFont } from "./font-loader";
import {
  BLEED_PT,
  COVER_WIDTH_PT,
  COVER_HEIGHT_PT,
  COVER_SPINE_PT,
  SOURCE_IMAGE_ASPECT,
} from "./constants";

export interface CoverGenerationInput {
  characterVersionId: string;
  childName: string;
  storySlug: string;
}

export interface CoverLayout {
  /** Total cover PDF width in points. */
  pageWidth: number;
  /** Total cover PDF height in points. */
  pageHeight: number;
  /** Spine width in points (derived from page count). */
  spineWidth: number;
  /** Single panel (front or back cover) trim width in points. */
  panelTrimWidth: number;
}

/** Detect image format from magic bytes. */
function detectContentType(bytes: Uint8Array): string {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  return "image/jpeg";
}

/**
 * Fetch the cover image URL for a character version from the database.
 */
async function fetchCoverImageUrl(
  characterVersionId: string
): Promise<string> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("character_version_scenes")
    .select("image_url")
    .eq("character_version_id", characterVersionId)
    .eq("scene_id", "cover")
    .single();

  if (error || !data) {
    throw new Error(
      `No cover image found for character version ${characterVersionId}. ` +
        `Generate the cover in the character pipeline first.`
    );
  }

  return data.image_url;
}

/**
 * Download an image from a URL. Retries up to 3 times.
 */
async function fetchImageBytes(url: string): Promise<Uint8Array> {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${url} (${response.status})`);
      }
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  throw new Error(`Failed to fetch image after ${maxRetries} retries: ${url}`);
}

/**
 * Build the cover layout from Lulu's known casewrap cover dimensions.
 *
 * The total cover PDF is one wide page:
 *   [bleed + back panel + spine + front panel + bleed]
 *
 * For casewrap hardcover, the cover panels are LARGER than the interior
 * pages because the cover material wraps around case boards that extend
 * beyond the text block. The dimensions come from Lulu's cover template
 * requirements (COVER_SPECS in constants.ts).
 */
export function getCoverLayout(): CoverLayout {
  const pageWidth = COVER_WIDTH_PT;
  const pageHeight = COVER_HEIGHT_PT;
  const spineWidth = COVER_SPINE_PT;
  const panelTrimWidth = (pageWidth - 2 * BLEED_PT - spineWidth) / 2;

  return { pageWidth, pageHeight, spineWidth, panelTrimWidth };
}

/**
 * Generate the cover PDF for a children's book.
 *
 * Layout (single page):
 *   Left: Back cover (solid color with title text)
 *   Center: Spine (solid color with title text)
 *   Right: Front cover (generated cover image)
 */
export async function generateCoverPdf(
  input: CoverGenerationInput
): Promise<Uint8Array> {
  const { characterVersionId, childName } = input;

  // Get cover layout from Lulu casewrap specs
  const layout = getCoverLayout();

  // Fetch cover image
  const coverImageUrl = await fetchCoverImageUrl(characterVersionId);
  const coverBytes = await fetchImageBytes(coverImageUrl);
  const coverContentType = detectContentType(coverBytes);

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  registerFontkit(pdfDoc);

  const font = await embedFont(pdfDoc, "serif");

  // Single page for the full cover spread
  const page = pdfDoc.addPage([layout.pageWidth, layout.pageHeight]);

  // -- Background: fill entire page with a warm cream/off-white --
  const bgColor = rgb(0.96, 0.94, 0.9);
  page.drawRectangle({
    x: 0,
    y: 0,
    width: layout.pageWidth,
    height: layout.pageHeight,
    color: bgColor,
  });

  // -- Front cover (right side): draw the cover image --
  const frontCoverX = BLEED_PT + layout.panelTrimWidth + layout.spineWidth;
  const frontCoverWidth = layout.panelTrimWidth + BLEED_PT; // extends to right bleed edge

  const coverImage =
    coverContentType === "image/png"
      ? await pdfDoc.embedPng(coverBytes)
      : await pdfDoc.embedJpg(coverBytes);

  // Scale cover image to fill the front cover panel (5:4 image into panel area)
  const panelHeight = layout.pageHeight; // full height including bleed
  const panelWidth = frontCoverWidth;

  // Scale to fill width, center vertically (same approach as interior)
  const imgDrawWidth = panelWidth;
  const imgDrawHeight = imgDrawWidth / SOURCE_IMAGE_ASPECT;
  const imgOffsetY = (panelHeight - imgDrawHeight) / 2;

  page.drawImage(coverImage, {
    x: frontCoverX,
    y: imgOffsetY,
    width: imgDrawWidth,
    height: imgDrawHeight,
  });

  // -- Spine (center): title text rotated 90 degrees --
  // Lulu recommends: no spine text if spine < 0.5 in (~36pt)
  // For thin spines, just leave it blank.
  const spineX = BLEED_PT + layout.panelTrimWidth;

  if (layout.spineWidth >= 36) {
    const spineCenterX = spineX + layout.spineWidth / 2;
    const spineCenterY = layout.pageHeight / 2;
    const spineTitle = "Momotaro - The Peach Boy";
    const spineFontSize = Math.min(layout.spineWidth * 0.6, 14);

    const spineTextWidth = font.widthOfTextAtSize(spineTitle, spineFontSize);
    page.drawText(spineTitle, {
      x: spineCenterX + spineFontSize * 0.35,
      y: spineCenterY + spineTextWidth / 2,
      size: spineFontSize,
      font,
      color: rgb(0.2, 0.15, 0.1),
      rotate: degrees(-90),
    });
  }

  // -- Back cover (left side): title and child's name --
  const backCenterX = BLEED_PT + layout.panelTrimWidth / 2;
  const backCenterY = layout.pageHeight / 2;

  const backTitle = "Momotaro";
  const backSubtitle = "The Peach Boy";
  const backDedication = `A story for ${childName}`;

  const titleFontSize = 36;
  const subtitleFontSize = 24;
  const dedicationFontSize = 16;

  const titleWidth = font.widthOfTextAtSize(backTitle, titleFontSize);
  const subtitleWidth = font.widthOfTextAtSize(backSubtitle, subtitleFontSize);
  const dedicationWidth = font.widthOfTextAtSize(backDedication, dedicationFontSize);

  const textColor = rgb(0.2, 0.15, 0.1);

  page.drawText(backTitle, {
    x: backCenterX - titleWidth / 2,
    y: backCenterY + 40,
    size: titleFontSize,
    font,
    color: textColor,
  });

  page.drawText(backSubtitle, {
    x: backCenterX - subtitleWidth / 2,
    y: backCenterY - 5,
    size: subtitleFontSize,
    font,
    color: textColor,
  });

  page.drawText(backDedication, {
    x: backCenterX - dedicationWidth / 2,
    y: backCenterY - 80,
    size: dedicationFontSize,
    font,
    color: textColor,
  });

  return pdfDoc.save();
}
