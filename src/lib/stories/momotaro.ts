import {
  buildBabyCharacterSheetPrompt,
  buildCharacterSheetPrompt,
} from "@/lib/prompts/character-sheet";
import { buildHeroPosterPrompt } from "@/lib/prompts/hero-poster";
import {
  getMomotaroTemplateUrl,
  MOMOTARO_COVER_TEMPLATE_URL,
  MOMOTARO_SCENES,
} from "@/lib/story-assets/momotaro";
import type { StoryConfig } from "./types";

export const MOMOTARO_CONFIG: StoryConfig = {
  slug: "momotaro",
  sheetPhases: [
    { phase: "baby", promptBuilder: buildBabyCharacterSheetPrompt },
    { phase: "child", promptBuilder: buildCharacterSheetPrompt },
  ],
  coverPhase: "child",
  coverTemplateUrl: MOMOTARO_COVER_TEMPLATE_URL,
  coverPromptBuilder: buildHeroPosterPrompt,
  scenes: MOMOTARO_SCENES.map((s) => ({
    id: s.id,
    page: s.page,
    phase: s.phase,
    title: s.title,
    templateUrl: getMomotaroTemplateUrl(s.filename),
  })),
};
