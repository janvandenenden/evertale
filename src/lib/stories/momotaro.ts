import {
  buildBabyCharacterSheetPrompt,
  buildCharacterSheetPrompt,
} from "@/lib/prompts/character-sheet";
import { buildHeroPosterPrompt } from "@/lib/prompts/hero-poster";
import type { StoryConfig } from "./types";

const COVER_TEMPLATE_URL =
  "https://pub-ff52a9b8fb2f4031be59d54e6d7b632f.r2.dev/cover-example.jpeg";

export const MOMOTARO_CONFIG: StoryConfig = {
  slug: "momotaro",
  sheetPhases: [
    { phase: "baby", promptBuilder: buildBabyCharacterSheetPrompt },
    { phase: "child", promptBuilder: buildCharacterSheetPrompt },
  ],
  coverPhase: "child",
  coverTemplateUrl: COVER_TEMPLATE_URL,
  coverPromptBuilder: buildHeroPosterPrompt,
  scenes: [
    { id: "baby-peach", phase: "baby", templateUrl: "" },
    { id: "baby-couple", phase: "baby", templateUrl: "" },
  ],
};
