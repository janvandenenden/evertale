import { PDFDocument } from "pdf-lib";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getFromR2 } from "@/lib/storage/r2";
import { MOMOTARO_SCENES } from "@/lib/story-assets/momotaro/scenes";
import { momotaroTextPages } from "@/lib/story-assets/momotaro/text-pages";
import { momotaroTextPageTemplates } from "@/lib/story-assets/momotaro/text-page-templates";
import { embedFonts, registerFontkit } from "./font-loader";
import { renderScenePage } from "./render-scene-page";
import { renderTextPage } from "./render-text-page";
import type { PdfGenerationInput } from "./types";
import type { TextPageTemplate } from "@/lib/text-pages/types";

/** Default natural width of source images in pixels (5:4 at common AI gen resolution). */
const DEFAULT_IMAGE_NATURAL_WIDTH = 1024;

function contentTypeFromKey(key: string): string {
  if (key.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

/**
 * Build a lookup from page number to text page template.
 * Throws if any required template is missing.
 */
function buildTemplateMap(
  pages: readonly number[]
): Map<number, TextPageTemplate> {
  const map = new Map<number, TextPageTemplate>();

  for (const template of momotaroTextPageTemplates) {
    // Extract page number from templateId (e.g., "1-river-introduction-text" -> 1)
    const pageNum = parseInt(template.templateId.split("-")[0], 10);
    if (!isNaN(pageNum)) {
      map.set(pageNum, template);
    }
  }

  const missing = pages.filter((p) => !map.has(p));
  if (missing.length > 0) {
    throw new Error(
      `Missing text page templates for pages: ${missing.join(", ")}. ` +
        `Configure them in text-page-templates.ts using the admin text-page editor.`
    );
  }

  return map;
}

/**
 * Fetch scene images for a character version from the database.
 * Returns a map from scene_id to image_url.
 */
async function fetchSceneImages(
  characterVersionId: string
): Promise<Map<string, string>> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("character_version_scenes")
    .select("scene_id, image_url")
    .eq("character_version_id", characterVersionId);

  if (error) {
    throw new Error(`Failed to fetch scenes: ${error.message}`);
  }

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row.scene_id, row.image_url);
  }
  return map;
}

/**
 * Download an image from a URL and return its bytes.
 */
async function fetchImageBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${url} (${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Generate the complete interior PDF for a children's book.
 *
 * Layout: alternating pages -- Scene 1, Text 1, Scene 2, Text 2, ...
 * Total pages: 54 (27 scenes + 27 text pages)
 */
export async function generateInteriorPdf(
  input: PdfGenerationInput
): Promise<Uint8Array> {
  const { characterVersionId, childName } = input;

  // Get all page numbers from scenes
  const pageNumbers = MOMOTARO_SCENES.map((s) => s.page);

  // Build template map (validates all templates exist)
  const templateMap = buildTemplateMap(pageNumbers);

  // Fetch scene image URLs from database
  const sceneImageMap = await fetchSceneImages(characterVersionId);

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  registerFontkit(pdfDoc);

  // Collect all unique font families from templates
  const fontFamilies = [
    ...new Set(
      momotaroTextPageTemplates.map((t) => t.font.family)
    ),
  ];
  const fontMap = await embedFonts(pdfDoc, fontFamilies);

  // Process each page sequentially to manage memory
  for (const scene of MOMOTARO_SCENES) {
    const sceneImageUrl = sceneImageMap.get(scene.id);
    if (!sceneImageUrl) {
      throw new Error(
        `No promoted scene image for "${scene.id}" (page ${scene.page}). ` +
          `Promote it in the admin story scenes page first.`
      );
    }

    // Render scene page
    const sceneBytes = await fetchImageBytes(sceneImageUrl);
    const sceneContentType = sceneImageUrl.endsWith(".png")
      ? "image/png"
      : "image/jpeg";
    await renderScenePage(pdfDoc, sceneBytes, sceneContentType);

    // Render text page
    const template = templateMap.get(scene.page)!;
    const textEntry = momotaroTextPages.find((t) => t.page === scene.page);
    if (!textEntry) {
      throw new Error(`No text entry for page ${scene.page}`);
    }

    // Replace {{name}} placeholder with child's name
    const personalizedText = textEntry.text.replace(
      /\{\{name\}\}/g,
      childName
    );

    // Fetch text page background image from R2
    const bgBytes = await getFromR2(template.imageKey);
    const bgContentType = contentTypeFromKey(template.imageKey);

    // Get the font for this template
    const font = fontMap.get(template.font.family);
    if (!font) {
      throw new Error(`Font "${template.font.family}" not embedded`);
    }

    await renderTextPage(
      pdfDoc,
      bgBytes,
      bgContentType,
      personalizedText,
      template,
      font,
      DEFAULT_IMAGE_NATURAL_WIDTH
    );
  }

  return pdfDoc.save();
}
