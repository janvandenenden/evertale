/** Percentage-based bounding box (all values 0-1) */
export interface TextBox {
  readonly xPct: number;
  readonly yPct: number;
  readonly wPct: number;
  readonly hPct: number;
}

export interface FontConfig {
  readonly family: string;
  readonly minSize: number;
  readonly maxSize: number;
  readonly lineHeight: number;
  readonly color: string;
}

export type TextAlign = "left" | "center" | "right";
export type TextVAlign = "top" | "center" | "bottom";

export interface TextPageTemplate {
  readonly templateId: string;
  readonly imageKey: string;
  readonly textBox: TextBox;
  readonly align: TextAlign;
  readonly valign: TextVAlign;
  readonly font: FontConfig;
  readonly maxLines: number;
}

export interface TextPageEntry {
  readonly page: number;
  readonly title: string;
  readonly text: string;
}
