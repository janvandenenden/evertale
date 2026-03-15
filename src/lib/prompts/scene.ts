export function buildScenePrompt(
  sceneId: string,
  childName: string,
  phase: "baby" | "child"
): string {
  const base = [
    "Use the scene template as the composition and scene reference.",
    "",
    "Replace the placeholder outline character with the character from the reference character sheet.",
    "",
    "Keep the exact pose, body proportions, and placement from the scene image.",
    "",
    "Maintain the same environment, lighting, and composition.",
    "",
    `The new character (${childName}) should match the style of the reference sheet while blending naturally into the watercolor storybook scene.`,
    "",
    "children's picture book illustration",
    "watercolor and ink",
    "soft pastel palette",
    "storybook style",
  ].join("\n");

  if (phase === "baby") {
    return [
      base,
      "",
      "The character is a baby in infant proportions, wearing a cream/beige linen diaper.",
    ].join("\n");
  }

  return base;
}
