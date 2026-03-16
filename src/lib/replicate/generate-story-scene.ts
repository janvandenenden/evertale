import type { SupabaseClient } from "@supabase/supabase-js";
import { generateSceneImage } from "@/lib/replicate/generate-scene";
import { uploadToR2 } from "@/lib/storage/r2";

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function buildAdminSceneStorageKey(
  workspaceId: string,
  sceneId: string,
  options?: { stable?: boolean }
): string {
  const sanitized = sceneId.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (options?.stable) {
    return `admin/workspaces/${workspaceId}/${sanitized}.png`;
  }
  const timestamp = Date.now();
  return `admin/workspaces/${workspaceId}/${timestamp}-${sanitized}.png`;
}

export interface GenerateStorySceneInput {
  supabase: SupabaseClient;
  workspaceId: string;
  sceneId: string;
  prompt: string;
  characterSheetUrl: string;
  templateUrl: string;
}

export async function generateStoryScenePanel(
  input: GenerateStorySceneInput
): Promise<{ imageUrl: string }> {
  const {
    supabase,
    workspaceId,
    sceneId,
    prompt,
    characterSheetUrl,
    templateUrl,
  } = input;

  const { data: gen } = await supabase
    .from("admin_story_scene_generations")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("scene_id", sceneId)
    .single();

  if (gen) {
    await supabase
      .from("admin_story_scene_generations")
      .update({
        status: "generating",
        error: null,
        prompt_text: prompt,
        template_url: templateUrl,
        character_sheet_url: characterSheetUrl,
      })
      .eq("id", gen.id);
  } else {
    await supabase.from("admin_story_scene_generations").insert({
      workspace_id: workspaceId,
      scene_id: sceneId,
      prompt_text: prompt,
      template_url: templateUrl,
      character_sheet_url: characterSheetUrl,
      status: "generating",
    });
  }

  try {
    const tempUrl = await generateSceneImage(
      prompt,
      characterSheetUrl,
      templateUrl
    );

    const buffer = await downloadImage(tempUrl);
    const key = buildAdminSceneStorageKey(workspaceId, sceneId, {
      stable: true,
    });
    const imageUrl = await uploadToR2(key, buffer, "image/png");

    const { error: updateError } = await supabase
      .from("admin_story_scene_generations")
      .update({
        image_url: imageUrl,
        status: "completed",
        error: null,
      })
      .eq("workspace_id", workspaceId)
      .eq("scene_id", sceneId);

    if (updateError) {
      throw new Error(`Failed to save generation: ${updateError.message}`);
    }

    return { imageUrl };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";

    await supabase
      .from("admin_story_scene_generations")
      .update({
        status: "failed",
        error: errorMessage,
      })
      .eq("workspace_id", workspaceId)
      .eq("scene_id", sceneId);

    throw err;
  }
}
