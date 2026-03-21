"use client";

import { useCallback, useRef } from "react";
import type { TextBox, TextAlign, TextVAlign } from "@/lib/text-pages/types";

interface TextBoxOverlayProps {
  readonly textBox: TextBox;
  readonly onChange: (box: TextBox) => void;
  readonly text: string;
  readonly fontSize: number;
  readonly displayScale: number;
  readonly lineHeight: number;
  readonly fontFamily: string;
  readonly fontColor: string;
  readonly align: TextAlign;
  readonly valign: TextVAlign;
  readonly previewMode?: boolean;
}

type HandlePosition =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w";

const HANDLE_SIZE = 10;
const MIN_SIZE_PCT = 0.02;

const handlePositions: Record<
  HandlePosition,
  { top: string; left: string; cursor: string }
> = {
  nw: { top: "-5px", left: "-5px", cursor: "nwse-resize" },
  n: { top: "-5px", left: "calc(50% - 5px)", cursor: "ns-resize" },
  ne: { top: "-5px", left: "calc(100% - 5px)", cursor: "nesw-resize" },
  e: { top: "calc(50% - 5px)", left: "calc(100% - 5px)", cursor: "ew-resize" },
  se: { top: "calc(100% - 5px)", left: "calc(100% - 5px)", cursor: "nwse-resize" },
  s: { top: "calc(100% - 5px)", left: "calc(50% - 5px)", cursor: "ns-resize" },
  sw: { top: "calc(100% - 5px)", left: "-5px", cursor: "nesw-resize" },
  w: { top: "calc(50% - 5px)", left: "-5px", cursor: "ew-resize" },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundPct(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function TextBoxOverlay({
  textBox,
  onChange,
  text,
  fontSize,
  displayScale,
  lineHeight,
  fontFamily,
  fontColor,
  align,
  valign,
  previewMode = false,
}: TextBoxOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getContainerRect = useCallback(() => {
    const parent = containerRef.current?.parentElement;
    return parent?.getBoundingClientRect() ?? null;
  }, []);

  const handleDragStart = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).dataset.handle) return;

      const rect = getContainerRect();
      if (!rect) return;

      e.currentTarget.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startY = e.clientY;
      const startBox = { ...textBox };

      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - startX) / rect.width;
        const dy = (ev.clientY - startY) / rect.height;
        const newX = clamp(startBox.xPct + dx, 0, 1 - startBox.wPct);
        const newY = clamp(startBox.yPct + dy, 0, 1 - startBox.hPct);
        onChange({
          ...startBox,
          xPct: roundPct(newX),
          yPct: roundPct(newY),
        });
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [textBox, onChange, getContainerRect]
  );

  const handleResizeStart = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, handle: HandlePosition) => {
      e.stopPropagation();
      const rect = getContainerRect();
      if (!rect) return;

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startY = e.clientY;
      const startBox = { ...textBox };

      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - startX) / rect.width;
        const dy = (ev.clientY - startY) / rect.height;

        let { xPct, yPct, wPct, hPct } = startBox;

        // Horizontal
        if (handle.includes("w")) {
          const newX = clamp(xPct + dx, 0, xPct + wPct - MIN_SIZE_PCT);
          wPct = wPct + (xPct - newX);
          xPct = newX;
        }
        if (handle.includes("e")) {
          wPct = clamp(wPct + dx, MIN_SIZE_PCT, 1 - xPct);
        }

        // Vertical
        if (handle.includes("n")) {
          const newY = clamp(yPct + dy, 0, yPct + hPct - MIN_SIZE_PCT);
          hPct = hPct + (yPct - newY);
          yPct = newY;
        }
        if (handle === "s" || handle === "se" || handle === "sw") {
          hPct = clamp(hPct + dy, MIN_SIZE_PCT, 1 - yPct);
        }

        onChange({
          xPct: roundPct(xPct),
          yPct: roundPct(yPct),
          wPct: roundPct(wPct),
          hPct: roundPct(hPct),
        });
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [textBox, onChange, getContainerRect]
  );

  const textAlignStyle = align === "left" ? "left" : align === "right" ? "right" : "center";

  const justifyContent =
    valign === "top" ? "flex-start" : valign === "bottom" ? "flex-end" : "center";

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: `${textBox.xPct * 100}%`,
        top: `${textBox.yPct * 100}%`,
        width: `${textBox.wPct * 100}%`,
        height: `${textBox.hPct * 100}%`,
      }}
      className={
        previewMode
          ? ""
          : "cursor-move border-2 border-dashed border-blue-500 bg-blue-500/10"
      }
      onPointerDown={previewMode ? undefined : handleDragStart}
    >
      {/* Resize handles */}
      {!previewMode &&
        (Object.entries(handlePositions) as [HandlePosition, typeof handlePositions[HandlePosition]][]).map(
          ([pos, style]) => (
            <div
              key={pos}
              data-handle="true"
              onPointerDown={(e) => handleResizeStart(e, pos)}
              style={{
                position: "absolute",
                top: style.top,
                left: style.left,
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                cursor: style.cursor,
              }}
              className="rounded-sm bg-blue-500 hover:bg-blue-600"
            />
          )
        )}

      {/* Preview text */}
      <div
        className="pointer-events-none flex h-full w-full select-none overflow-hidden px-1"
        style={{
          flexDirection: "column",
          justifyContent,
        }}
      >
        <p
          style={{
            fontSize: `${fontSize * displayScale}px`,
            lineHeight: lineHeight,
            fontFamily,
            color: fontColor,
            textAlign: textAlignStyle,
            wordWrap: "break-word",
            overflowWrap: "break-word",
            margin: 0,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
