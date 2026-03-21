import type { TextPageTemplate } from "@/lib/text-pages/types";

export const momotaroTextPageTemplates: readonly TextPageTemplate[] = [
  // Populated via the admin text-page editor.
  // Copy the generated template config and paste entries here.
  {
    templateId: "1-river-introduction-text",
    imageKey: "momotaro/text-pages/1-river-introduction-text.jpeg",
    textBox: { xPct: 0.2871, yPct: 0.1946, wPct: 0.608, hPct: 0.5927 },
    align: "left",
    valign: "center",
    font: {
      family: "Nunito",
      minSize: 28,
      maxSize: 28,
      lineHeight: 1.4,
      color: "#2d2520",
    },
    maxLines: 10,
  },
  {
    templateId: "2-peach-appears-text",
    imageKey: "momotaro/text-pages/2-peach-appears-text.jpeg",
    textBox: { xPct: 0.1412, yPct: 0.2451, wPct: 0.6993, hPct: 0.3998 },
    align: "left",
    valign: "center",
    font: {
      family: "Nunito",
      minSize: 30,
      maxSize: 34,
      lineHeight: 1.4,
      color: "#2d2520",
    },
    maxLines: 10,
  },
];
