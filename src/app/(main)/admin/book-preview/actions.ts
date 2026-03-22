"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminClerkUserId } from "@/lib/admin";
import {
  MOMOTARO_SCENES,
  getMomotaroTemplateUrl,
} from "@/lib/story-assets/momotaro";
import { momotaroTextPages } from "@/lib/story-assets/momotaro/text-pages";
import { momotaroTextPageTemplates } from "@/lib/story-assets/momotaro/text-page-templates";
import { getPublicUrl } from "@/lib/storage/r2";
import type { TextBox, FontConfig, TextAlign, TextVAlign } from "@/lib/text-pages/types";
import type { ActionResult } from "@/lib/types";

async function requireAdmin(): Promise<{ clerkUserId: string }> {
  const { userId } = await auth();
  if (!userId || !isAdminClerkUserId(userId)) {
    throw new Error("Forbidden");
  }
  return { clerkUserId: userId };
}

export interface CharacterVersionOption {
  characterVersionId: string;
  childName: string;
  storySlug: string;
}

export async function getCharacterVersions(): Promise<
  ActionResult<CharacterVersionOption[]>
> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden" };
  }

  const supabase = createServerSupabaseClient();

  const { data: versions, error } = await supabase
    .from("character_versions")
    .select(
      `
      id,
      children!inner(name),
      stories!inner(slug)
    `
    )
    .eq("status", "completed");

  if (error || !versions) {
    return { success: false, error: error?.message ?? "Failed to load" };
  }

  return {
    success: true,
    data: versions.map((v) => {
      const child = v.children as unknown as { name: string };
      const story = v.stories as unknown as { slug: string };
      return {
        characterVersionId: v.id,
        childName: child.name,
        storySlug: story.slug,
      };
    }),
  };
}

export interface TextTemplateData {
  textBox: TextBox;
  align: TextAlign;
  valign: TextVAlign;
  font: FontConfig;
  maxLines: number;
}

export interface SpreadData {
  page: number;
  sceneId: string;
  sceneTitle: string;
  sceneImageUrl: string | null;
  hasProtagonist: boolean;
  textPageImageUrl: string | null;
  textPageTemplateConfigured: boolean;
  textTemplate: TextTemplateData | null;
  text: string;
}

export async function getBookSpreads(
  characterVersionId: string
): Promise<ActionResult<SpreadData[]>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden" };
  }

  const supabase = createServerSupabaseClient();

  // Fetch promoted scene images
  const { data: scenes } = await supabase
    .from("character_version_scenes")
    .select("scene_id, image_url")
    .eq("character_version_id", characterVersionId);

  const sceneMap = new Map<string, string>();
  for (const s of scenes ?? []) {
    sceneMap.set(s.scene_id, s.image_url);
  }

  // Build template lookup by page number
  const templateByPage = new Map<number, (typeof momotaroTextPageTemplates)[number]>();
  for (const t of momotaroTextPageTemplates) {
    const pageNum = parseInt(t.templateId.split("-")[0], 10);
    if (!isNaN(pageNum)) {
      templateByPage.set(pageNum, t);
    }
  }

  const r2Base = getPublicUrl();

  const spreads: SpreadData[] = MOMOTARO_SCENES.map((scene) => {
    const textEntry = momotaroTextPages.find((t) => t.page === scene.page);
    const template = templateByPage.get(scene.page);

    // Scenes without a protagonist use the static template image.
    // Scenes with a protagonist need a promoted (generated) image.
    const sceneImageUrl = scene.hasProtagonist
      ? sceneMap.get(scene.id) ?? null
      : getMomotaroTemplateUrl(scene.filename);

    return {
      page: scene.page,
      sceneId: scene.id,
      sceneTitle: scene.title,
      sceneImageUrl,
      hasProtagonist: scene.hasProtagonist,
      textPageImageUrl: template
        ? `${r2Base}/${template.imageKey}`
        : null,
      textPageTemplateConfigured: !!template,
      textTemplate: template
        ? {
            textBox: template.textBox,
            align: template.align,
            valign: template.valign,
            font: template.font,
            maxLines: template.maxLines,
          }
        : null,
      text: textEntry?.text ?? "",
    };
  });

  return { success: true, data: spreads };
}
