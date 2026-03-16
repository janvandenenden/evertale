import type { SupabaseClient } from "@supabase/supabase-js";
import { generateImage, CHARACTER_SHEET_OUTLINE_URL } from "@/lib/replicate/generate-character";
import { generateSceneImage } from "@/lib/replicate/generate-scene";
import { getStoryConfig } from "@/lib/stories";
import { uploadToR2, buildStoryStorageKey } from "@/lib/storage/r2";
import { withRetry } from "@/lib/retry";

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function runCharacterPipeline(
  supabase: SupabaseClient,
  characterVersionId: string,
  childName: string,
  userId: string,
  photoUrl: string
): Promise<void> {
  const maxRetries = 2;

  const { data: charVersion } = await supabase
    .from("character_versions")
    .select("id, story_id")
    .eq("id", characterVersionId)
    .single();

  if (!charVersion) {
    throw new Error("Character version not found");
  }

  const { data: story } = await supabase
    .from("stories")
    .select("slug")
    .eq("id", charVersion.story_id)
    .single();

  if (!story) {
    throw new Error("Story not found");
  }

  const config = getStoryConfig(story.slug);
  if (!config) {
    throw new Error(`Story config not found: ${story.slug}`);
  }

  const storySlug = story.slug;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await supabase
        .from("character_versions")
        .update({
          status: "generating_character",
          generation_count: attempt,
        })
        .eq("id", characterVersionId);

      const sheetPhaseToUrl: Record<string, string> = {};

      for (const { phase, promptBuilder } of config.sheetPhases) {
        const prompt = promptBuilder();
        const tempUrl = await withRetry(() =>
          generateImage(prompt, photoUrl, {
            outlineUrl: CHARACTER_SHEET_OUTLINE_URL,
          })
        );

        const buffer = await withRetry(() => downloadImage(tempUrl));
        const key = buildStoryStorageKey(
          storySlug,
          "characters",
          userId,
          `${characterVersionId}-${phase}-sheet.png`,
          { stable: true }
        );
        const imageUrl = await uploadToR2(key, buffer, "image/png");

        const { error: sheetError } = await supabase
          .from("character_sheets")
          .upsert(
            {
              character_version_id: characterVersionId,
              story_id: charVersion.story_id,
              phase,
              image_url: imageUrl,
            },
            { onConflict: "character_version_id,phase" }
          );

        if (sheetError) {
          throw new Error(`Failed to save character sheet: ${sheetError.message}`);
        }

        sheetPhaseToUrl[phase] = imageUrl;
      }

      await supabase
        .from("character_versions")
        .update({ status: "generating_preview" })
        .eq("id", characterVersionId);

      const coverSheetUrl = sheetPhaseToUrl[config.coverPhase];
      if (!coverSheetUrl) {
        throw new Error(`Cover phase "${config.coverPhase}" has no sheet`);
      }

      const coverPrompt = config.coverPromptBuilder(childName);
      const coverTempUrl = await withRetry(() =>
        generateSceneImage(
          coverPrompt,
          coverSheetUrl,
          config.coverTemplateUrl
        )
      );

      const coverBuffer = await withRetry(() => downloadImage(coverTempUrl));
      const coverKey = buildStoryStorageKey(
        storySlug,
        "previews",
        userId,
        `${characterVersionId}-cover.png`,
        { stable: true }
      );
      const coverUrl = await uploadToR2(coverKey, coverBuffer, "image/png");

      const { error: coverError } = await supabase
        .from("character_version_scenes")
        .upsert(
          {
            character_version_id: characterVersionId,
            scene_id: "cover",
            image_url: coverUrl,
          },
          { onConflict: "character_version_id,scene_id" }
        );

      if (coverError) {
        throw new Error(`Failed to save cover: ${coverError.message}`);
      }

      await supabase
        .from("character_versions")
        .update({ status: "completed" })
        .eq("id", characterVersionId);

      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (attempt >= maxRetries) {
        await supabase
          .from("character_versions")
          .update({
            status: "failed",
            last_error: errorMessage,
            generation_count: attempt,
          })
          .eq("id", characterVersionId);
      }
    }
  }
}
