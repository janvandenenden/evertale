import type { StoryConfig } from "./types";
import { MOMOTARO_CONFIG } from "./momotaro";

const STORY_CONFIGS: Record<string, StoryConfig> = {
  momotaro: MOMOTARO_CONFIG,
};

export function getStoryConfig(slug: string): StoryConfig | null {
  return STORY_CONFIGS[slug] ?? null;
}

export type { StoryConfig, StoryScene, StorySheetPhase } from "./types";
