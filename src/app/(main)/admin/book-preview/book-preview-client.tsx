"use client";

import { useState, useCallback, useTransition, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TextBoxOverlay } from "@/components/text-pages/text-box-overlay";
import {
  fitText,
  createCanvasMeasureWidth,
  type MeasureWidth,
} from "@/lib/text-pages/fit-text";
import { resolveCanvasFontFamily } from "@/lib/text-pages/font-family";
import {
  getBookSpreads,
  type CharacterVersionOption,
  type SpreadData,
} from "./actions";

interface BookPreviewClientProps {
  characterVersions: CharacterVersionOption[];
}

export function BookPreviewClient({
  characterVersions,
}: BookPreviewClientProps) {
  const [selectedVersion, setSelectedVersion] =
    useState<CharacterVersionOption | null>(null);
  const [spreads, setSpreads] = useState<SpreadData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [childName, setChildName] = useState("");
  const [isLoading, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfR2Url, setPdfR2Url] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    status: string;
    errors: string[];
    pageCount: string | null;
    validPodPackageIds: string[];
  } | null>(null);

  // Track text page image natural + displayed dimensions for text fitting
  const [naturalDimensions, setNaturalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [displayedDimensions, setDisplayedDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const textImgRef = useRef<HTMLImageElement>(null);
  const measureWidthRef = useRef<MeasureWidth | null>(null);

  useEffect(() => {
    measureWidthRef.current = createCanvasMeasureWidth(resolveCanvasFontFamily);
  }, []);

  // Track displayed image size with ResizeObserver
  useEffect(() => {
    const img = textImgRef.current;
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
  }, [currentPage, spreads]);

  const loadSpreads = useCallback(
    (version: CharacterVersionOption) => {
      startTransition(async () => {
        setError(null);
        const result = await getBookSpreads(version.characterVersionId);
        if (result.success) {
          setSpreads(result.data);
          setChildName(version.childName);
          setCurrentPage(0);
        } else {
          setError(result.error);
        }
      });
    },
    [startTransition]
  );

  const handleSelectVersion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const version = characterVersions.find(
      (v) => v.characterVersionId === e.target.value
    );
    setSelectedVersion(version ?? null);
    setValidationResult(null);
    if (version) {
      loadSpreads(version);
      const saved = localStorage.getItem(`pdf-r2-url:${version.characterVersionId}`);
      setPdfR2Url(saved);
    } else {
      setPdfR2Url(null);
    }
  };

  const handleGeneratePdf = async () => {
    if (!selectedVersion || !childName.trim()) return;

    setIsGenerating(true);
    setError(null);
    setPdfR2Url(null);
    setValidationResult(null);

    try {
      const response = await fetch("/api/admin/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterVersionId: selectedVersion.characterVersionId,
          childName: childName.trim(),
          storySlug: selectedVersion.storySlug,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "PDF generation failed");
      }

      // Capture R2 URL for Lulu validation
      const r2Url = response.headers.get("X-R2-Url");
      if (r2Url) {
        setPdfR2Url(r2Url);
        localStorage.setItem(
          `pdf-r2-url:${selectedVersion.characterVersionId}`,
          r2Url
        );
      }

      // Trigger browser download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        "interior.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidatePdf = async () => {
    if (!pdfR2Url) return;

    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      // Start validation
      const startRes = await fetch("/api/admin/validate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: pdfR2Url }),
      });

      if (!startRes.ok) {
        const data = await startRes.json();
        throw new Error(data.error ?? "Validation request failed");
      }

      const validation = await startRes.json();
      let result = validation;

      // Poll until validation completes (status starts as null, then VALIDATING, then final)
      while (result.status !== "VALIDATED" && result.status !== "ERROR") {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(
          `/api/admin/validate-pdf?validationId=${result.id}`
        );
        if (!pollRes.ok) {
          const data = await pollRes.json();
          throw new Error(data.error ?? "Validation poll failed");
        }
        result = await pollRes.json();
      }

      setValidationResult({
        status: result.status,
        errors: result.errors ?? [],
        pageCount: result.page_count ?? null,
        validPodPackageIds: result.valid_pod_package_ids ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setIsValidating(false);
    }
  };

  const currentSpread = spreads[currentPage];
  const personalizedText = currentSpread
    ? currentSpread.text.replace(/\{\{name\}\}/g, childName || "{{name}}")
    : "";

  // Fit text using the same algorithm as the text-page editor
  const fitResult = useMemo(() => {
    const template = currentSpread?.textTemplate;
    if (!template || !naturalDimensions || !measureWidthRef.current) {
      return null;
    }

    const boxWidthPx = naturalDimensions.width * template.textBox.wPct;
    const boxHeightPx = naturalDimensions.height * template.textBox.hPct;

    return fitText(
      personalizedText,
      boxWidthPx,
      boxHeightPx,
      template.font,
      template.maxLines,
      measureWidthRef.current
    );
  }, [personalizedText, naturalDimensions, currentSpread?.textTemplate]);

  // Scale factor: natural image size -> displayed size
  const displayScale = useMemo(() => {
    if (!naturalDimensions || !displayedDimensions) return 1;
    return displayedDimensions.width / naturalDimensions.width;
  }, [naturalDimensions, displayedDimensions]);

  // Count readiness
  const configuredTemplates = spreads.filter(
    (s) => s.textPageTemplateConfigured
  ).length;
  const availableScenes = spreads.filter((s) => s.sceneImageUrl).length;
  const protagonistScenes = spreads.filter((s) => s.hasProtagonist);
  const promotedProtagonistScenes = protagonistScenes.filter(
    (s) => s.sceneImageUrl
  ).length;
  const allReady =
    spreads.length > 0 &&
    configuredTemplates === spreads.length &&
    availableScenes === spreads.length;

  return (
    <div className="mt-8 space-y-6">
      {/* Character version selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select character version</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            value={selectedVersion?.characterVersionId ?? ""}
            onChange={handleSelectVersion}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Choose a character version...</option>
            {characterVersions.map((v) => (
              <option key={v.characterVersionId} value={v.characterVersionId}>
                {v.childName} ({v.storySlug})
              </option>
            ))}
          </select>

          {selectedVersion && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Child name:</label>
              <Input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Enter child's name"
                className="max-w-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {/* Readiness summary */}
      {spreads.length > 0 && !isLoading && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex gap-4">
              <Badge variant={promotedProtagonistScenes === protagonistScenes.length ? "default" : "secondary"}>
                Promoted scenes: {promotedProtagonistScenes}/{protagonistScenes.length}
              </Badge>
              <Badge
                variant={
                  configuredTemplates === spreads.length
                    ? "default"
                    : "secondary"
                }
              >
                Text templates: {configuredTemplates}/{spreads.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleGeneratePdf}
                disabled={!allReady || isGenerating || !childName.trim()}
              >
                {isGenerating ? "Generating PDF..." : "Generate Interior PDF"}
              </Button>
              {pdfR2Url && (
                <Button
                  variant="outline"
                  onClick={handleValidatePdf}
                  disabled={isValidating}
                >
                  {isValidating ? "Validating..." : "Validate with Lulu"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lulu validation result */}
      {validationResult && (
        <Card>
          <CardContent className="py-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Lulu validation:</span>
              <Badge
                variant={validationResult.status === "VALIDATED" ? "default" : "destructive"}
              >
                {validationResult.status}
              </Badge>
              {validationResult.pageCount && (
                <span className="text-sm text-muted-foreground">
                  {validationResult.pageCount} pages detected
                </span>
              )}
            </div>
            {validationResult.errors.length > 0 && (
              <ul className="list-disc pl-5 text-sm text-destructive">
                {validationResult.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
            {validationResult.validPodPackageIds.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Valid POD packages: {validationResult.validPodPackageIds.join(", ")}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Spread navigator */}
      {currentSpread && !isLoading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Page {currentSpread.page}: {currentSpread.sceneTitle}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage + 1} / {spreads.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(spreads.length - 1, p + 1))
                  }
                  disabled={currentPage === spreads.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Scene image */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Scene illustration</p>
                <div className="relative aspect-[5/4] overflow-hidden rounded-lg border bg-muted">
                  {currentSpread.sceneImageUrl ? (
                    <Image
                      src={currentSpread.sceneImageUrl}
                      alt={currentSpread.sceneTitle}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      {currentSpread.hasProtagonist
                        ? "No promoted scene image"
                        : "Template image not found"}
                    </div>
                  )}
                </div>
              </div>

              {/* Text page with accurate text overlay */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Text page</p>
                  {!currentSpread.textPageTemplateConfigured && (
                    <Badge variant="destructive">Template not configured</Badge>
                  )}
                </div>
                <div className="relative aspect-[5/4] overflow-hidden rounded-lg border bg-muted">
                  {currentSpread.textPageImageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={textImgRef}
                        src={currentSpread.textPageImageUrl}
                        alt={`Text page ${currentSpread.page}`}
                        className="h-full w-full object-cover"
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          setNaturalDimensions({
                            width: img.naturalWidth,
                            height: img.naturalHeight,
                          });
                          setDisplayedDimensions({
                            width: img.clientWidth,
                            height: img.clientHeight,
                          });
                        }}
                      />
                      {/* Accurate text overlay using TextBoxOverlay */}
                      {currentSpread.textTemplate && fitResult && (
                        <TextBoxOverlay
                          textBox={currentSpread.textTemplate.textBox}
                          onChange={() => {}}
                          text={personalizedText}
                          fontSize={fitResult.fontSize}
                          displayScale={displayScale}
                          lineHeight={currentSpread.textTemplate.font.lineHeight}
                          fontFamily={currentSpread.textTemplate.font.family}
                          fontColor={currentSpread.textTemplate.font.color}
                          align={currentSpread.textTemplate.align}
                          valign={currentSpread.textTemplate.valign}
                          previewMode
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                      {currentSpread.textPageTemplateConfigured
                        ? "Background image not found"
                        : "Configure template in the text-page editor first"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="mt-4 rounded-md border bg-muted/50 p-4">
              <p className="text-sm leading-relaxed">{personalizedText}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page thumbnails */}
      {spreads.length > 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>All pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-9 gap-2">
              {spreads.map((spread, index) => (
                <button
                  key={spread.page}
                  onClick={() => setCurrentPage(index)}
                  className={`relative aspect-[5/4] overflow-hidden rounded border text-xs transition-all ${
                    index === currentPage
                      ? "ring-2 ring-primary"
                      : "hover:ring-1 hover:ring-primary/50"
                  }`}
                >
                  {spread.sceneImageUrl ? (
                    <Image
                      src={spread.sceneImageUrl}
                      alt={`Page ${spread.page}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                      {spread.page}
                    </div>
                  )}
                  {((spread.hasProtagonist && !spread.sceneImageUrl) ||
                    !spread.textPageTemplateConfigured) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-destructive/80 px-1 py-0.5 text-center text-[10px] text-destructive-foreground">
                      {spread.hasProtagonist && !spread.sceneImageUrl
                        ? "No scene"
                        : "No template"}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
