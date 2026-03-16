import {
  FILL_OUT_BASE,
  MOMOTARO_SCENES,
  getMomotaroTemplateUrl,
  getMomotaroTemplateUrlForSceneId,
} from "@/lib/story-assets/momotaro";
import type { MomotaroSceneDef } from "@/lib/story-assets/momotaro";
import { buildHeroPosterPrompt } from "@/lib/prompts/hero-poster";
import { getStoryConfig } from "@/lib/stories";

export function buildStoryScenePrompt(
  scene: MomotaroSceneDef,
  childName: string,
): string {
  const parts: string[] = [FILL_OUT_BASE];

  if (scene.fillOutOverride?.expression) {
    parts.push("");
    parts.push(`Protagonist expression: ${scene.fillOutOverride.expression}`);
  }
  return parts.join("\n");
}

export function getMomotaroSceneByPage(
  page: number,
): MomotaroSceneDef | undefined {
  return MOMOTARO_SCENES.find((s) => s.page === page);
}

export function getMomotaroSceneById(id: string): MomotaroSceneDef | undefined {
  return MOMOTARO_SCENES.find((s) => s.id === id);
}

export function getMomotaroScenesForPhase(
  phase: "baby" | "child",
): MomotaroSceneDef[] {
  return MOMOTARO_SCENES.filter((s) => s.phase === phase);
}

export function getMomotaroSceneIds(): string[] {
  return ["cover", ...MOMOTARO_SCENES.map((s) => s.id)];
}

export function buildScenesWithTemplateFallback(
  storySlug: string,
  scenesFromDb: Array<{ scene_id: string; image_url: string }>,
): Array<{ scene_id: string; image_url: string }> {
  if (storySlug !== "momotaro") return scenesFromDb;
  const sceneIds = getMomotaroSceneIds();
  const byId = new Map(scenesFromDb.map((s) => [s.scene_id, s.image_url]));
  return sceneIds.map((sceneId) => ({
    scene_id: sceneId,
    image_url: byId.get(sceneId) ?? getMomotaroTemplateUrlForSceneId(sceneId),
  }));
}

export function getMomotaroSceneIdsForGeneration(): string[] {
  return [
    "cover",
    ...MOMOTARO_SCENES.filter((s) => s.hasProtagonist).map((s) => s.id),
  ];
}

export function sceneNeedsGeneration(
  storySlug: string,
  sceneId: string,
): boolean {
  if (storySlug !== "momotaro") return false;
  if (sceneId === "cover") return true;
  const scene = getMomotaroSceneById(sceneId);
  return scene?.hasProtagonist ?? false;
}

export function getScenePhase(
  storySlug: string,
  sceneId: string,
): "baby" | "child" | null {
  if (storySlug !== "momotaro") return null;
  if (sceneId === "cover") {
    const config = getStoryConfig("momotaro");
    return (config?.coverPhase as "baby" | "child") ?? null;
  }
  const scene = getMomotaroSceneById(sceneId);
  return scene?.phase ?? null;
}

export function getScenePromptForGeneration(
  storySlug: string,
  sceneId: string,
  childName: string,
): { prompt: string; templateUrl: string; phase: "baby" | "child" } | null {
  if (storySlug !== "momotaro") return null;
  if (!sceneNeedsGeneration(storySlug, sceneId)) return null;

  if (sceneId === "cover") {
    const config = getStoryConfig("momotaro");
    if (!config) return null;
    return {
      prompt: buildHeroPosterPrompt(childName),
      templateUrl: config.coverTemplateUrl,
      phase: config.coverPhase as "baby" | "child",
    };
  }

  const scene = getMomotaroSceneById(sceneId);
  if (!scene) return null;

  return {
    prompt: buildStoryScenePrompt(scene, childName),
    templateUrl: getMomotaroTemplateUrl(scene.filename),
    phase: scene.phase,
  };
}
