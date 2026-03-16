"use client";

import { Input } from "@/components/ui/input";
import type { FontConfig, TextAlign, TextVAlign } from "@/lib/text-pages/types";

interface TypographyControlsProps {
  readonly font: FontConfig;
  readonly align: TextAlign;
  readonly valign: TextVAlign;
  readonly maxLines: number;
  readonly onFontChange: (font: FontConfig) => void;
  readonly onAlignChange: (align: TextAlign) => void;
  readonly onVAlignChange: (valign: TextVAlign) => void;
  readonly onMaxLinesChange: (maxLines: number) => void;
}

function Label({
  children,
  htmlFor,
}: {
  readonly children: React.ReactNode;
  readonly htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium text-muted-foreground"
    >
      {children}
    </label>
  );
}

export function TypographyControls({
  font,
  align,
  valign,
  maxLines,
  onFontChange,
  onAlignChange,
  onVAlignChange,
  onMaxLinesChange,
}: TypographyControlsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Typography</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="font-family">Font Family</Label>
          <select
            id="font-family"
            value={font.family}
            onChange={(e) =>
              onFontChange({ ...font, family: e.target.value })
            }
            className="flex h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm shadow-xs"
          >
            <option value="Nunito">Nunito</option>
            <option value="Georgia">Georgia</option>
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans-serif</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="color">Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="text"
              value={font.color}
              onChange={(e) =>
                onFontChange({ ...font, color: e.target.value })
              }
              className="h-9 flex-1"
            />
            <input
              type="color"
              value={font.color}
              onChange={(e) =>
                onFontChange({ ...font, color: e.target.value })
              }
              className="h-9 w-9 cursor-pointer rounded border border-input"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="min-size">Min Size</Label>
          <Input
            id="min-size"
            type="number"
            min={8}
            max={200}
            value={font.minSize}
            onChange={(e) =>
              onFontChange({ ...font, minSize: Number(e.target.value) })
            }
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="max-size">Max Size</Label>
          <Input
            id="max-size"
            type="number"
            min={8}
            max={200}
            value={font.maxSize}
            onChange={(e) =>
              onFontChange({ ...font, maxSize: Number(e.target.value) })
            }
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="line-height">Line Height</Label>
          <Input
            id="line-height"
            type="number"
            min={0.8}
            max={3}
            step={0.1}
            value={font.lineHeight}
            onChange={(e) =>
              onFontChange({ ...font, lineHeight: Number(e.target.value) })
            }
            className="h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="align">Align</Label>
          <select
            id="align"
            value={align}
            onChange={(e) => onAlignChange(e.target.value as TextAlign)}
            className="flex h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm shadow-xs"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="valign">V-Align</Label>
          <select
            id="valign"
            value={valign}
            onChange={(e) => onVAlignChange(e.target.value as TextVAlign)}
            className="flex h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm shadow-xs"
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="max-lines">Max Lines</Label>
          <Input
            id="max-lines"
            type="number"
            min={1}
            max={50}
            value={maxLines}
            onChange={(e) => onMaxLinesChange(Number(e.target.value))}
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
}
