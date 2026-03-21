import { describe, it, expect } from "vitest";
import { wrapText, fitText, type MeasureWidth } from "../fit-text";
import type { FontConfig } from "../types";

// Mock measureWidth: each character is roughly `fontSize * 0.6` wide
const mockMeasureWidth: MeasureWidth = (text, fontSize, _fontFamily) => {
  return text.length * fontSize * 0.6;
};

describe("wrapText", () => {
  it("returns empty array for empty string", () => {
    expect(wrapText("", 200, 16, "sans-serif", mockMeasureWidth)).toEqual([]);
  });

  it("returns single line when text fits", () => {
    const lines = wrapText("Hello", 200, 16, "sans-serif", mockMeasureWidth);
    expect(lines).toEqual(["Hello"]);
  });

  it("wraps text into multiple lines", () => {
    // "Hello world test" at 16px: each char ~9.6px
    // maxWidth = 100px => ~10 chars per line
    const lines = wrapText(
      "Hello world test here",
      100,
      16,
      "sans-serif",
      mockMeasureWidth
    );
    expect(lines.length).toBeGreaterThan(1);
    // Every word should be present in joined result
    expect(lines.join(" ")).toBe("Hello world test here");
  });

  it("puts each word on its own line if very narrow", () => {
    const lines = wrapText(
      "One Two Three",
      30,
      16,
      "sans-serif",
      mockMeasureWidth
    );
    expect(lines).toEqual(["One", "Two", "Three"]);
  });
});

describe("fitText", () => {
  const baseFont: FontConfig = {
    family: "sans-serif",
    minSize: 10,
    maxSize: 48,
    lineHeight: 1.4,
    color: "#000",
  };

  it("returns minimum size when even min does not fit", () => {
    // Tiny box: 10px wide, 10px tall
    const result = fitText(
      "This is a very long text that cannot fit",
      10,
      10,
      baseFont,
      2,
      mockMeasureWidth
    );
    expect(result.fontSize).toBe(baseFont.minSize);
  });

  it("finds a font size between min and max", () => {
    const result = fitText(
      "Short text",
      400,
      200,
      baseFont,
      5,
      mockMeasureWidth
    );
    expect(result.fontSize).toBeGreaterThanOrEqual(baseFont.minSize);
    expect(result.fontSize).toBeLessThanOrEqual(baseFont.maxSize);
  });

  it("respects maxLines constraint", () => {
    const result = fitText(
      "A B C D E F G H I J K L M N O P",
      100,
      500,
      baseFont,
      3,
      mockMeasureWidth
    );
    expect(result.lines.length).toBeLessThanOrEqual(3);
  });

  it("uses larger font for shorter text", () => {
    const short = fitText("Hi", 400, 200, baseFont, 5, mockMeasureWidth);
    const long = fitText(
      "This is a much longer piece of text that should require smaller font",
      400,
      200,
      baseFont,
      5,
      mockMeasureWidth
    );
    expect(short.fontSize).toBeGreaterThanOrEqual(long.fontSize);
  });

  it("all words are preserved in output lines", () => {
    const input = "The quick brown fox jumps over the lazy dog";
    const result = fitText(input, 300, 300, baseFont, 10, mockMeasureWidth);
    const joined = result.lines.join(" ");
    expect(joined).toBe(input);
  });
});
