import type { SupabaseClient } from "@supabase/supabase-js";
import { generateImage, CHARACTER_SHEET_OUTLINE_URL } from "@/lib/replicate/generate-character";
import { generateSceneImage } from "@/lib/replicate/generate-scene";
import { buildScenePrompt } from "@/lib/prompts/scene";
import { getStoryConfig } from "@/lib/stories";
import { uploadToR2, buildStoryStorageKey } from "@/lib/storage/r2";

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
        const tempUrl = await generateImage(prompt, photoUrl, {
          outlineUrl: CHARACTER_SHEET_OUTLINE_URL,
        });

        const buffer = await downloadImage(tempUrl);
        const key = buildStoryStorageKey(
          storySlug,
          "characters",
          userId,
          `${characterVersionId}-${phase}-sheet.png`,
          { stable: true }
        );
        const imageUrl = await uploadToR2(key, buffer, "image/png");

        const { error: sheetError } = await supabase.from("character_sheets").insert({
          character_version_id: characterVersionId,
          story_id: charVersion.story_id,
          phase,
          image_url: imageUrl,
        });

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
      const coverTempUrl = await generateSceneImage(
        coverPrompt,
        coverSheetUrl,
        config.coverTemplateUrl
      );

      const coverBuffer = await downloadImage(coverTempUrl);
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
        .insert({
          character_version_id: characterVersionId,
          scene_id: "cover",
          image_url: coverUrl,
        });

      if (coverError) {
        throw new Error(`Failed to save cover: ${coverError.message}`);
      }

      for (const scene of config.scenes) {
        if (!scene.templateUrl) continue;

        const sceneSheetUrl = sheetPhaseToUrl[scene.phase];
        if (!sceneSheetUrl) continue;

        const scenePrompt = buildScenePrompt(scene.id, childName, scene.phase as "baby" | "child");
        const sceneTempUrl = await generateSceneImage(
          scenePrompt,
          sceneSheetUrl,
          scene.templateUrl
        );

        const sceneBuffer = await downloadImage(sceneTempUrl);
        const sceneKey = buildStoryStorageKey(
          storySlug,
          "assets",
          userId,
          `${characterVersionId}-${scene.id}.png`
        );
        const sceneImageUrl = await uploadToR2(sceneKey, sceneBuffer, "image/png");

        await supabase.from("character_version_scenes").insert({
          character_version_id: characterVersionId,
          scene_id: scene.id,
          image_url: sceneImageUrl,
        });
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
