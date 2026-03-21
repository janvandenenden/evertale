"use server";

import { listR2Objects, type R2Object } from "@/lib/storage/list-r2";
import { momotaroTextPageTemplates } from "@/lib/story-assets/momotaro/text-page-templates";
import type { TextPageTemplate } from "@/lib/text-pages/types";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function listTextPageImages(
  storySlug: string
): Promise<ActionResult<R2Object[]>> {
  try {
    const objects = await listR2Objects(`${storySlug}/text-pages/`);
    const images = objects
      .filter((obj) => /\.(jpg|jpeg|png|webp)$/i.test(obj.key))
      .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
    return { success: true, data: images };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function loadExistingTemplates(): Promise<
  ActionResult<TextPageTemplate[]>
> {
  try {
    return { success: true, data: [...momotaroTextPageTemplates] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
