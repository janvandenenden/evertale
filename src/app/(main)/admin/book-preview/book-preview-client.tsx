"use client";

import { useState, useCallback, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    if (version) {
      loadSpreads(version);
    }
  };

  const handleGeneratePdf = async () => {
    if (!selectedVersion || !childName.trim()) return;

    setIsGenerating(true);
    setError(null);

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

  const currentSpread = spreads[currentPage];
  const personalizedText = currentSpread
    ? currentSpread.text.replace(/\{\{name\}\}/g, childName || "{{name}}")
    : "";

  // Count readiness
  const configuredTemplates = spreads.filter(
    (s) => s.textPageTemplateConfigured
  ).length;
  const availableScenes = spreads.filter((s) => s.sceneImageUrl).length;
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
              <Badge variant={availableScenes === spreads.length ? "default" : "secondary"}>
                Scenes: {availableScenes}/{spreads.length}
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
            <Button
              onClick={handleGeneratePdf}
              disabled={!allReady || isGenerating || !childName.trim()}
            >
              {isGenerating ? "Generating PDF..." : "Generate Interior PDF"}
            </Button>
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
                      No scene image promoted
                    </div>
                  )}
                </div>
              </div>

              {/* Text page */}
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
                      <Image
                        src={currentSpread.textPageImageUrl}
                        alt={`Text page ${currentSpread.page}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      {/* Text overlay preview */}
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <p className="text-center text-xs leading-relaxed text-stone-800/70">
                          {personalizedText}
                        </p>
                      </div>
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
                  {(!spread.sceneImageUrl ||
                    !spread.textPageTemplateConfigured) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-destructive/80 px-1 py-0.5 text-center text-[10px] text-destructive-foreground">
                      {!spread.sceneImageUrl ? "No scene" : "No template"}
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
