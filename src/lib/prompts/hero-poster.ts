export function buildHeroPosterPrompt(childName: string): string {
  return [
    "Use the cover image as the composition and scene reference.",
    "",
    "Replace the placeholder outline character with the character from the reference character sheet.",
    "",
    "Keep the exact pose, body proportions, and placement from the scene image.",
    "",
    "Maintain the same environment, lighting, and composition.",
    "",
    `Update the cover text so [NAME] becomes ${childName}.`,
    "",
    `The new character (${childName}) should match the style of the reference sheet while blending naturally into the watercolor storybook scene.`,
    "",
    "children's picture book illustration",
    "watercolor and ink",
    "soft pastel palette",
    "storybook style",
    "",
    "Scene includes: child hero, old man, old woman, dog, monkey, pheasant, ogres in a Momotaro folktale setting.",
  ].join("\n");
}
