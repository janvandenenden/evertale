"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { R2Object } from "@/lib/storage/list-r2";
import type {
  TextBox,
  FontConfig,
  TextAlign,
  TextVAlign,
  TextPageTemplate,
  TextPageEntry,
} from "@/lib/text-pages/types";
import { fitText, createCanvasMeasureWidth, type MeasureWidth } from "@/lib/text-pages/fit-text";
import { resolveCanvasFontFamily } from "@/lib/text-pages/font-family";
import { ImagePicker } from "@/components/text-pages/image-picker";
import { TextBoxOverlay } from "@/components/text-pages/text-box-overlay";
import { TypographyControls } from "@/components/text-pages/typography-controls";
import { TemplateOutput } from "@/components/text-pages/template-output";
import { MOMOTARO_SCENES, getMomotaroTemplateUrl } from "@/lib/story-assets/momotaro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface TextPageEditorClientProps {
  readonly images: R2Object[];
  readonly templates: TextPageTemplate[];
  readonly textPages: readonly TextPageEntry[];
}

const DEFAULT_TEXT_BOX: TextBox = {
  xPct: 0.1,
  yPct: 0.1,
  wPct: 0.8,
  hPct: 0.3,
};

const DEFAULT_FONT: FontConfig = {
  family: "serif",
  minSize: 28,
  maxSize: 28,
  lineHeight: 1.4,
  color: "#2d2520",
};

export function TextPageEditorClient({
  images,
  templates,
  textPages,
}: TextPageEditorClientProps) {
  const [selectedImage, setSelectedImage] = useState<R2Object | null>(null);
  const [textBox, setTextBox] = useState<TextBox>(DEFAULT_TEXT_BOX);
  const [font, setFont] = useState<FontConfig>(DEFAULT_FONT);
  const [align, setAlign] = useState<TextAlign>("left");
  const [valign, setValign] = useState<TextVAlign>("center");
  const [maxLines, setMaxLines] = useState(10);
  const [previewText, setPreviewText] = useState(
    textPages[0]?.text ?? "The quick brown fox jumps over the lazy dog."
  );
  const [selectedPage, setSelectedPage] = useState<number>(textPages[0]?.page ?? 0);
  const [previewMode, setPreviewMode] = useState(false);
  const [childName, setChildName] = useState("Momo");
  const [naturalDimensions, setNaturalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [displayedDimensions, setDisplayedDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const measureWidthRef = useRef<MeasureWidth | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    measureWidthRef.current = createCanvasMeasureWidth(resolveCanvasFontFamily);
  }, []);

  // Track displayed image size with ResizeObserver
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDisplayedDimensions({ width, height });
        }
      }
    });

    observer.observe(img);
    return () => observer.disconnect();
  }, [selectedImage]);

  const handlePageSelect = useCallback(
    (pageNum: number) => {
      const entry = textPages.find((p) => p.page === pageNum);
      if (entry) {
        setSelectedPage(pageNum);
        setPreviewText(entry.text.replace(/\{\{name\}\}/g, childName));
      }
    },
    [textPages, childName]
  );

  const handleImageSelect = useCallback(
    (image: R2Object) => {
      setSelectedImage(image);
      setNaturalDimensions(null);
      setDisplayedDimensions(null);
      // Load existing template if one exists for this image
      const existing = templates.find((t) => t.imageKey === image.key);
      if (existing) {
        setTextBox(existing.textBox);
        setFont(existing.font);
        setAlign(existing.align);
        setValign(existing.valign);
        setMaxLines(existing.maxLines);
      }
    },
    [templates]
  );

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setNaturalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setDisplayedDimensions({
        width: img.clientWidth,
        height: img.clientHeight,
      });
    },
    []
  );

  // Fit against natural (full-res) dimensions — these are the real sizes
  // that will be used for final book rendering
  const fitResult = useMemo(() => {
    if (!naturalDimensions || !measureWidthRef.current) {
      return { fontSize: font.minSize, lines: [previewText] };
    }

    const boxWidthPx = naturalDimensions.width * textBox.wPct;
    const boxHeightPx = naturalDimensions.height * textBox.hPct;

    return fitText(
      previewText,
      boxWidthPx,
      boxHeightPx,
      font,
      maxLines,
      measureWidthRef.current
    );
  }, [previewText, naturalDimensions, textBox, font, maxLines]);

  // Scale factor to translate natural font sizes to on-screen preview
  const displayScale = useMemo(() => {
    if (!naturalDimensions || !displayedDimensions) return 1;
    return displayedDimensions.width / naturalDimensions.width;
  }, [naturalDimensions, displayedDimensions]);

  const sceneImageUrl = useMemo(() => {
    const scene = MOMOTARO_SCENES.find((s) => s.page === selectedPage);
    return scene ? getMomotaroTemplateUrl(scene.filename) : null;
  }, [selectedPage]);

  const templateOutput = useMemo<TextPageTemplate | null>(() => {
    if (!selectedImage) return null;
    const fileName = selectedImage.key.split("/").pop() ?? "";
    const id = fileName.replace(/\.[^.]+$/, "");
    return {
      templateId: id,
      imageKey: selectedImage.key,
      textBox,
      align,
      valign,
      font,
      maxLines,
    };
  }, [selectedImage, textBox, align, valign, font, maxLines]);

  return (
    <div className="mt-6 space-y-6">
      {/* Image Picker */}
      <section>
        <h2 className="mb-3 text-sm font-semibold">Select Image</h2>
        <ImagePicker
          images={images}
          templates={[...templates]}
          selectedKey={selectedImage?.key ?? null}
          onSelect={handleImageSelect}
        />
      </section>

      {selectedImage && (
        <>
          <Separator />

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left: Image preview with overlay */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold">
                  {previewMode ? "Clean Preview" : "Editor"}
                  {naturalDimensions && (
                    <span className="ml-2 font-normal text-muted-foreground">
                      {naturalDimensions.width} x {naturalDimensions.height}px
                      {" | "}Fitted: {fitResult.fontSize}px
                    </span>
                  )}
                </h2>
                <Button
                  size="sm"
                  variant={previewMode ? "default" : "secondary"}
                  onClick={() => setPreviewMode((v) => !v)}
                >
                  {previewMode ? "Back to Editor" : "Clean Preview"}
                </Button>
              </div>

              {previewMode && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="child-name"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Child Name
                  </label>
                  <Input
                    id="child-name"
                    value={childName}
                    onChange={(e) => {
                      setChildName(e.target.value);
                      const entry = textPages.find(
                        (p) => p.page === selectedPage
                      );
                      if (entry) {
                        setPreviewText(
                          entry.text.replace(
                            /\{\{name\}\}/g,
                            e.target.value || "Child"
                          )
                        );
                      }
                    }}
                    className="h-8 w-48"
                    placeholder="Enter child name"
                  />
                </div>
              )}

              <div className="flex gap-2">
                {/* Scene image (left page) */}
                {sceneImageUrl && (
                  <div className="w-1/2 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sceneImageUrl}
                      alt={`Scene for page ${selectedPage}`}
                      className="block w-full rounded border border-muted"
                      draggable={false}
                    />
                  </div>
                )}

                {/* Text page (right page) */}
                <div
                  className={`relative ${sceneImageUrl ? "w-1/2" : "w-full"} flex-shrink-0`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={selectedImage.url}
                    alt="Text page background"
                    onLoad={handleImageLoad}
                    className="block w-full"
                    draggable={false}
                  />
                  <TextBoxOverlay
                    textBox={textBox}
                    onChange={setTextBox}
                    text={previewText}
                    fontSize={fitResult.fontSize}
                    displayScale={displayScale}
                    lineHeight={font.lineHeight}
                    fontFamily={font.family}
                    fontColor={font.color}
                    align={align}
                    valign={valign}
                    previewMode={previewMode}
                  />
                </div>
              </div>
            </section>

            {/* Right: Controls */}
            <aside className="space-y-5">
              {/* Page selector */}
              <div className="space-y-1">
                <label
                  htmlFor="page-select"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Story Page
                </label>
                <select
                  id="page-select"
                  value={selectedPage}
                  onChange={(e) => handlePageSelect(Number(e.target.value))}
                  className="flex h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  {textPages.map((entry) => (
                    <option key={entry.page} value={entry.page}>
                      {entry.page}. {entry.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview text */}
              <div className="space-y-1">
                <label
                  htmlFor="preview-text"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Preview Text
                </label>
                <textarea
                  id="preview-text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  rows={4}
                  className="flex w-full rounded border border-input bg-background px-3 py-2 text-sm shadow-xs"
                />
              </div>

              <Separator />

              <TypographyControls
                font={font}
                align={align}
                valign={valign}
                maxLines={maxLines}
                onFontChange={setFont}
                onAlignChange={setAlign}
                onVAlignChange={setValign}
                onMaxLinesChange={setMaxLines}
              />

              <Separator />

              {/* Box coordinates (read-only display) */}
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Text Box Position</h3>
                <div className="grid grid-cols-4 gap-2">
                  {(["xPct", "yPct", "wPct", "hPct"] as const).map((key) => (
                    <div key={key} className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {key}
                      </span>
                      <Input
                        type="number"
                        step={0.01}
                        min={0}
                        max={1}
                        value={textBox[key]}
                        onChange={(e) =>
                          setTextBox({ ...textBox, [key]: Number(e.target.value) })
                        }
                        className="h-7 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <TemplateOutput template={templateOutput} />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
