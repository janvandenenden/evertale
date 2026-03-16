import type { SupabaseClient } from "@supabase/supabase-js";
import { getStoryConfig } from "@/lib/stories";
import { MOMOTARO_SCENES } from "@/lib/story-assets/momotaro";
import { getScenePromptForGeneration } from "@/lib/prompts/story-scene";
import { generateStoryScenePanel } from "@/lib/replicate/generate-story-scene";

const ENABLE_POST_RESERVATION_GENERATION =
  process.env.ENABLE_POST_RESERVATION_GENERATION === "true";

export function isPostReservationGenerationEnabled(): boolean {
  return ENABLE_POST_RESERVATION_GENERATION;
}

export async function triggerPostReservationGeneration(
  supabase: SupabaseClient,
  characterVersionId: string,
  childName: string,
  storySlug: string
): Promise<void> {
  if (!ENABLE_POST_RESERVATION_GENERATION) return;

  const config = getStoryConfig(storySlug);
  if (!config) return;

  const { data: charVersion } = await supabase
    .from("character_versions")
    .select("id")
    .eq("id", characterVersionId)
    .single();

  if (!charVersion) return;

  const { data: story } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", storySlug)
    .single();

  if (!story) return;

  const { data: sheets } = await supabase
    .from("character_sheets")
    .select("id, phase, image_url")
    .eq("character_version_id", characterVersionId);

  if (!sheets || sheets.length === 0) return;

  const coverSheet = sheets.find((s) => s.phase === config.coverPhase);
  if (!coverSheet) return;

  const { data: workspace, error: wsError } = await supabase
    .from("admin_story_scene_workspaces")
    .insert({
      story_id: story.id,
      character_version_id: characterVersionId,
      character_sheet_id: coverSheet.id,
      phase: config.coverPhase,
      child_name: childName,
    })
    .select("id")
    .single();

  if (wsError || !workspace) return;

  const sheetsByPhase: Record<string, string> = {};
  for (const s of sheets) {
    sheetsByPhase[s.phase] = s.image_url;
  }

  const sceneIds = [
    "cover",
    ...MOMOTARO_SCENES.filter((s) => s.hasProtagonist).map((s) => s.id),
  ];

  for (const sceneId of sceneIds) {
    const promptResult = getScenePromptForGeneration(
      storySlug,
      sceneId,
      childName
    );
    if (!promptResult) continue;

    const characterSheetUrl = sheetsByPhase[promptResult.phase];
    if (!characterSheetUrl) continue;

    generateStoryScenePanel({
      supabase,
      workspaceId: workspace.id,
      sceneId,
      prompt: promptResult.prompt,
      characterSheetUrl,
      templateUrl: promptResult.templateUrl,
    }).catch(() => {
      // Fire-and-forget; failures logged by generateStoryScenePanel
    });
  }
}
