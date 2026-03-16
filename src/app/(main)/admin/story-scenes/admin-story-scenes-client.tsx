"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createOrGetWorkspace, getWorkspaceWithGenerations, promotePanel } from "./actions";
import {
  getMomotaroSceneIds,
  getMomotaroSceneIdsForGeneration,
  getScenePhase,
  sceneNeedsGeneration,
} from "@/lib/prompts/story-scene";
import { getMomotaroTemplateUrlForSceneId } from "@/lib/story-assets/momotaro";

interface CharacterVersionOption {
  characterVersionId: string;
  childName: string;
  storySlug: string;
  sheets: Array< { id: string; phase: string; imageUrl: string }>;
}

interface GenerationState {
  sceneId: string;
  status: string;
  imageUrl: string | null;
  error: string | null;
}

const MOMOTARO_SCENE_LABELS: Record<string, string> = {
  cover: "Cover",
  "river-introduction": "1. River Introduction",
  "peach-appears": "2. Peach Appears",
  "carry-peach": "3. Carrying the Peach",
  "examine-peach": "4. Examine the Peach",
  "peach-opens": "5. Peach Opens",
  "couple-hold-child": "6. Couple Hold Child",
  "getting-strong": "7. Getting Strong",
  "learning-about-ogres": "8. Learning About Ogres",
  "declaring-quest": "9. Declaring Quest",
  "preparing-dumplings": "10. Dumplings",
  "leaving-home": "11. Leaving Home",
  "meeting-the-dog": "12. Meeting the Dog",
  "sharing-the-dumpling": "13. Sharing Dumpling",
  "monkey-joins": "14. Monkey Joins",
  "monkey-get-dumpling": "15. Monkey Gets Dumpling",
  "pheasant-joins": "16. Pheasant Joins",
  "pheasant-gets-dumpling": "17. Pheasant Gets Dumpling",
  "looking-at-island": "18. Looking at Island",
  "boat-journey": "19. Boat Journey",
  "ogre-fortress": "20. Ogre Fortress",
  "ogre-infiltration": "21. Ogre Infiltration",
  "battle-scene": "22. Battle Scene",
  "ogres-surrender": "23. Ogres Surrender",
  "take-treasure": "24. Take Treasure",
  "saying-goodbye": "25. Saying Goodbye",
  "celebration": "26. Celebration",
  "peaceful-ending": "27. Peaceful Ending",
};

interface AdminStoryScenesClientProps {
  characterVersions: CharacterVersionOption[];
}

export function AdminStoryScenesClient({
  characterVersions,
}: AdminStoryScenesClientProps) {
  const [storySlug, setStorySlug] = useState("momotaro");
  const [selectedVersion, setSelectedVersion] = useState<CharacterVersionOption | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [generations, setGenerations] = useState<GenerationState[]>([]);
  const [generatingScenes, setGeneratingScenes] = useState<Set<string>>(new Set());
  const [generatingAll, setGeneratingAll] = useState(false);
  const [promotingScene, setPromotingScene] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const refreshWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    const result = await getWorkspaceWithGenerations(workspaceId);
    if (result.success && result.data) {
      setGenerations(result.data.generations);
    }
  }, [workspaceId]);

  const handleSelectCharacter = async () => {
    if (!selectedVersion) return;

    const result = await createOrGetWorkspace(
      storySlug,
      selectedVersion.characterVersionId,
      selectedVersion.childName
    );

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setWorkspaceId(result.data.workspaceId);
    const wsResult = await getWorkspaceWithGenerations(result.data.workspaceId);
    if (wsResult.success && wsResult.data) {
      setGenerations(wsResult.data.generations);
    }
  };

  const handleGenerate = async (sceneId: string) => {
    if (!workspaceId) return;

    setGeneratingScenes((prev) => new Set(prev).add(sceneId));
    try {
      const res = await fetch("/api/admin/generate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId, scene_id: sceneId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Generation failed");
        return;
      }

      toast.success(`Generated ${MOMOTARO_SCENE_LABELS[sceneId] ?? sceneId}`);
      await refreshWorkspace();
    } finally {
      setGeneratingScenes((prev) => {
        const next = new Set(prev);
        next.delete(sceneId);
        return next;
      });
    }
  };

  const handleGenerateAll = async () => {
    if (!workspaceId) return;

    const sceneIds = getMomotaroSceneIdsForGeneration();
    setGeneratingAll(true);

    for (const sceneId of sceneIds) {
      setGeneratingScenes((prev) => new Set(prev).add(sceneId));
      try {
        const res = await fetch("/api/admin/generate-scene", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspace_id: workspaceId, scene_id: sceneId }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(`${sceneId}: ${data.error ?? "failed"}`);
        }
      } catch {
        toast.error(`${sceneId}: request failed`);
      } finally {
        setGeneratingScenes((prev) => {
          const next = new Set(prev);
          next.delete(sceneId);
          return next;
        });
      }
      await refreshWorkspace();
    }

    setGeneratingAll(false);
    toast.success("Generate all complete");
  };

  const handlePromote = async (sceneId: string) => {
    if (!workspaceId) return;

    setPromotingScene(sceneId);
    const result = await promotePanel(workspaceId, sceneId);
    setPromotingScene(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(`Promoted ${MOMOTARO_SCENE_LABELS[sceneId] ?? sceneId}`);
  };

  const getGen = (sceneId: string) =>
    generations.find((g) => g.sceneId === sceneId);

  const momotaroVersions = characterVersions.filter((v) => v.storySlug === "momotaro");

  return (
    <div className="mt-8 space-y-8">
      {workspaceId && (
        <Card>
          <CardHeader>
            <CardTitle>Review queue</CardTitle>
            <p className="text-sm text-muted-foreground">
              Character versions with generated panels. Select above to switch workspace.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {momotaroVersions.map((v) => (
                <li key={v.characterVersionId} className="flex items-center gap-2">
                  <span className="font-medium">{v.childName}</span>
                  <span className="text-muted-foreground">
                    ({v.sheets.length} sheet{v.sheets.length !== 1 ? "s" : ""})
                  </span>
                  {v.characterVersionId === selectedVersion?.characterVersionId && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select character</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Story</label>
            <select
              value={storySlug}
              onChange={(e) => setStorySlug(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="momotaro">Momotaro</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Character version
            </label>
            <select
              value={selectedVersion?.characterVersionId ?? ""}
              onChange={(e) => {
                const v = characterVersions.find(
                  (c) => c.characterVersionId === e.target.value
                );
                setSelectedVersion(v ?? null);
              }}
              className="w-full max-w-md rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Choose...</option>
              {momotaroVersions.map((v) => (
                <option key={v.characterVersionId} value={v.characterVersionId}>
                  {v.childName} ({v.storySlug})
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleSelectCharacter}
            disabled={!selectedVersion || selectedVersion.sheets.length === 0}
          >
            Open workspace
          </Button>
        </CardContent>
      </Card>

      {workspaceId && (
        <>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleGenerateAll}
              disabled={generatingAll}
              variant="secondary"
            >
              {generatingAll ? "Generating..." : "Generate all"}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getMomotaroSceneIds().map((sceneId) => {
              const gen = getGen(sceneId);
              const templateUrl = getMomotaroTemplateUrlForSceneId(sceneId);
              const isGenerating =
                generatingScenes.has(sceneId) || gen?.status === "generating";

              return (
                <Card key={sceneId} size="sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {MOMOTARO_SCENE_LABELS[sceneId] ?? sceneId}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {!sceneNeedsGeneration("momotaro", sceneId) && (
                        <Badge variant="outline" className="text-xs">
                          no protagonist
                        </Badge>
                      )}
                      {getScenePhase("momotaro", sceneId) && (
                        <Badge variant="outline" className="text-xs">
                          {getScenePhase("momotaro", sceneId) === "baby"
                            ? "baby sheet"
                            : "child sheet"}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          gen?.status === "completed"
                            ? "default"
                            : gen?.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {gen?.status ?? "not started"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="aspect-[5/4] overflow-hidden rounded-lg bg-muted">
                      {gen?.imageUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              url: gen.imageUrl!,
                              title: MOMOTARO_SCENE_LABELS[sceneId] ?? sceneId,
                            })
                          }
                          className="h-full w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <img
                            src={gen.imageUrl}
                            alt={sceneId}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ) : templateUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              url: templateUrl,
                              title: `${MOMOTARO_SCENE_LABELS[sceneId] ?? sceneId} (template)`,
                            })
                          }
                          className="h-full w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <img
                            src={templateUrl}
                            alt={`Template ${sceneId}`}
                            className="h-full w-full object-cover opacity-60"
                          />
                        </button>
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No preview
                        </div>
                      )}
                    </div>

                    {gen?.error && (
                      <p className="text-xs text-destructive">{gen.error}</p>
                    )}

                    {sceneNeedsGeneration("momotaro", sceneId) && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleGenerate(sceneId)}
                          disabled={isGenerating}
                        >
                          {isGenerating ? "..." : gen ? "Reroll" : "Generate"}
                        </Button>
                        {gen?.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePromote(sceneId)}
                            disabled={promotingScene === sceneId}
                          >
                            {promotingScene === sceneId ? "..." : "Promote"}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Dialog
            open={!!previewImage}
            onOpenChange={(open) => !open && setPreviewImage(null)}
          >
            <DialogContent className="max-w-[95vw] sm:max-w-6xl p-0 overflow-hidden">
              <DialogHeader className="p-4 pb-0">
                <DialogTitle>
                  {previewImage?.title ?? "Preview"}
                </DialogTitle>
              </DialogHeader>
              {previewImage && (
                <div className="p-4 pt-2 flex justify-center">
                  <img
                    src={previewImage.url}
                    alt={previewImage.title}
                    className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
