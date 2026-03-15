export function buildCharacterSheetPrompt(): string {
  return [
    "Use the character sheet outline as the composition and pose reference.",
    "",
    "Fill the outline poses with the child from the reference photo. Keep the exact pose layout from the outline.",
    "",
    "Keep recognizable facial features but stylize for a watercolor picture book.",
    "",
    "Show: front view, side view, three-quarter view, smiling, running, neutral pose. Wearing a simple red yukata.",
    "",
    "Clean white background, no text, multiple poses and expressions.",
  ].join("\n");
}

export function buildBabyCharacterSheetPrompt(): string {
  return [
    "Use the character sheet outline as the composition and pose reference.",
    "",
    "Age-regress the child from the reference photo into an infant/baby. Fill the outline poses with the baby.",
    "",
    "Keep recognizable facial features (eyes, skin tone, hair color) but use baby proportions.",
    "",
    "The baby wears a cream/beige linen diaper (simple wrap style). No nudity.",
    "",
    "Clean white background, no text. Watercolor picture book style.",
  ].join("\n");
}
