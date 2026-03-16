export const STYLE_BLOCK = [
  "children's picture book illustration",
  "watercolor and ink",
  "soft pastel palette",
  "storybook style",
  "textured watercolor paper",
].join(",\n");

export const FILL_OUT_BASE = [
  "Replace the placeholder outline character with the character from the reference character sheet.",
  "Keep the exact pose, body proportions, and placement from the scene image.",
  "",
  "Maintain the same environment, lighting, and composition.",
  "The new character should match the style of the reference sheet while blending naturally into the watercolor storybook scene.",
].join("\n");

export interface FillOutOverride {
  expression?: string;
}

export interface MomotaroSceneDef {
  page: number;
  id: string;
  title: string;
  filename: string;
  phase: "baby" | "child";
  hasProtagonist: boolean;
  templatePrompt: string;
  fillOutOverride?: FillOutOverride;
  referenceIds: string[];
}
