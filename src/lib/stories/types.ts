export type StoryPhase = string;

export interface StorySheetPhase {
  phase: StoryPhase;
  promptBuilder: (opts?: { childName?: string }) => string;
}

export interface StoryScene {
  id: string;
  page: number;
  phase: StoryPhase;
  templateUrl: string;
  title?: string;
}

export interface StoryConfig {
  slug: string;
  sheetPhases: StorySheetPhase[];
  coverPhase: StoryPhase;
  coverTemplateUrl: string;
  coverPromptBuilder: (childName: string) => string;
  scenes: StoryScene[];
}
