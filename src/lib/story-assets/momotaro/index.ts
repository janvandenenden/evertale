import { MOMOTARO_SCENES } from "./scenes";
export { MOMOTARO_SCENES } from "./scenes";
export * from "./references";
export type { MomotaroSceneDef, FillOutOverride } from "./types";
export { STYLE_BLOCK, FILL_OUT_BASE } from "./types";

const R2_BASE = "https://pub-ff52a9b8fb2f4031be59d54e6d7b632f.r2.dev";

export const MOMOTARO_COVER_TEMPLATE_URL = `${R2_BASE}/cover-example.jpeg`;

const MOMOTARO_SCENE_TEMPLATE_BASE = `${R2_BASE}/momotaro/scenes`;

export function getMomotaroTemplateUrl(filename: string): string {
  return `${MOMOTARO_SCENE_TEMPLATE_BASE}/${filename}`;
}

export function getMomotaroTemplateUrlForSceneId(sceneId: string): string {
  if (sceneId === "cover") return MOMOTARO_COVER_TEMPLATE_URL;
  const scene = MOMOTARO_SCENES.find((s) => s.id === sceneId);
  return scene ? getMomotaroTemplateUrl(scene.filename) : "";
}

export function getMomotaroSceneTemplateUrlsOrdered(): string[] {
  return MOMOTARO_SCENES.map((s) => getMomotaroTemplateUrl(s.filename));
}
