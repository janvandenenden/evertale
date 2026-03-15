"use client";

import { useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CharacterSheetItem {
  phase: string;
  image_url: string;
}

interface SceneItem {
  scene_id: string;
  image_url: string;
}

interface CharacterPreviewPanelProps {
  characterSheets: CharacterSheetItem[];
  scenes: SceneItem[];
  childName: string;
  sourcePhotoUrl?: string | null;
  showOverlay?: boolean;
}

type PreviewView =
  | { type: "sheet"; phase: string }
  | { type: "cover" }
  | { type: "scene"; sceneId: string }
  | { type: "original" };

function formatPhaseLabel(phase: string): string {
  return phase.charAt(0).toUpperCase() + phase.slice(1);
}

function formatSceneLabel(sceneId: string): string {
  return sceneId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function CharacterPreviewPanel({
  characterSheets,
  scenes,
  childName,
  sourcePhotoUrl = null,
  showOverlay = true,
}: CharacterPreviewPanelProps) {
  const coverScene = useMemo(
    () => scenes.find((s) => s.scene_id === "cover"),
    [scenes]
  );
  const storyScenes = useMemo(
    () => scenes.filter((s) => s.scene_id !== "cover"),
    [scenes]
  );

  const availableViews = useMemo((): PreviewView[] => {
    const views: PreviewView[] = [];

    for (const sheet of characterSheets) {
      views.push({ type: "sheet", phase: sheet.phase });
    }
    if (coverScene) {
      views.push({ type: "cover" });
    }
    for (const s of storyScenes) {
      views.push({ type: "scene", sceneId: s.scene_id });
    }
    if (sourcePhotoUrl) {
      views.push({ type: "original" });
    }

    return views;
  }, [characterSheets, coverScene, storyScenes, sourcePhotoUrl]);

  function viewEquals(a: PreviewView, b: PreviewView): boolean {
    if (a.type !== b.type) return false;
    if (a.type === "sheet" && b.type === "sheet") return a.phase === b.phase;
    if (a.type === "scene" && b.type === "scene") return a.sceneId === b.sceneId;
    return true;
  }

  const defaultView: PreviewView = coverScene
    ? { type: "cover" }
    : characterSheets.length > 0
      ? { type: "sheet", phase: characterSheets[0].phase }
      : storyScenes.length > 0
        ? { type: "scene", sceneId: storyScenes[0].scene_id }
        : { type: "original" };

  const initialView =
    availableViews.find((v) => viewEquals(v, defaultView)) ??
    availableViews[0] ??
    ({ type: "original" } as PreviewView);

  const [activeView, setActiveView] = useState<PreviewView>(initialView);

  const resolvedView =
    availableViews.find((v) => viewEquals(v, activeView)) ??
    availableViews[0] ??
    ({ type: "original" } as PreviewView);

  const imageUrl = useMemo(() => {
    if (resolvedView.type === "sheet") {
      return characterSheets.find((s) => s.phase === resolvedView.phase)?.image_url ?? null;
    }
    if (resolvedView.type === "cover") {
      return coverScene?.image_url ?? null;
    }
    if (resolvedView.type === "scene") {
      return storyScenes.find((s) => s.scene_id === resolvedView.sceneId)?.image_url ?? null;
    }
    return sourcePhotoUrl ?? null;
  }, [resolvedView, characterSheets, coverScene, storyScenes, sourcePhotoUrl]);

  const isSheetView = resolvedView.type === "sheet";

  return (
    <section className="relative min-h-[55vh] overflow-hidden bg-warm/20 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:min-h-0">
      {showOverlay && availableViews.length > 1 && (
        <div className="absolute top-4 right-4 z-10 inline-flex flex-wrap justify-end gap-1 rounded-full border border-border/60 bg-background/85 p-1 shadow-lg backdrop-blur">
          {characterSheets.map((sheet) => (
            <Button
              key={sheet.phase}
              type="button"
              variant={
                resolvedView.type === "sheet" && resolvedView.phase === sheet.phase
                  ? "secondary"
                  : "ghost"
              }
              size="sm"
              className="rounded-full"
              onClick={() => setActiveView({ type: "sheet", phase: sheet.phase })}
              title={`Character sheet (${formatPhaseLabel(sheet.phase)})`}
            >
              Sheet: {formatPhaseLabel(sheet.phase)}
            </Button>
          ))}
          {coverScene && (
            <Button
              type="button"
              variant={resolvedView.type === "cover" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full"
              onClick={() => setActiveView({ type: "cover" })}
              title="Cover image"
            >
              Cover
            </Button>
          )}
          {storyScenes.map((s) => (
            <Button
              key={s.scene_id}
              type="button"
              variant={
                resolvedView.type === "scene" && resolvedView.sceneId === s.scene_id
                  ? "secondary"
                  : "ghost"
              }
              size="sm"
              className="rounded-full"
              onClick={() => setActiveView({ type: "scene", sceneId: s.scene_id })}
              title={formatSceneLabel(s.scene_id)}
            >
              {formatSceneLabel(s.scene_id)}
            </Button>
          ))}
          {sourcePhotoUrl && (
            <Button
              type="button"
              variant={resolvedView.type === "original" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full"
              onClick={() => setActiveView({ type: "original" })}
              title="Original photo"
            >
              Original
            </Button>
          )}
        </div>
      )}

      <div className="h-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={
              resolvedView.type === "original"
                ? `Original photo of ${childName}`
                : resolvedView.type === "sheet"
                  ? `${childName}'s character sheet (${formatPhaseLabel(resolvedView.phase)})`
                  : resolvedView.type === "cover"
                    ? `${childName}'s story cover`
                    : `${childName} in ${formatSceneLabel(resolvedView.sceneId)}`
            }
            className={cn(
              "h-full w-full",
              isSheetView ? "object-contain bg-background" : "object-cover"
            )}
          />
        ) : (
          <div className="flex h-full min-h-[55vh] items-center justify-center bg-background/70 lg:min-h-0">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="mx-auto size-12 opacity-40" />
              <p className="mt-3 text-sm">Preview is being generated...</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
