"use client";

import { useCallback, useState } from "react";
import { ChildInfoForm } from "./child-info-form";
import { PhotoUpload } from "./photo-upload";
import { GenerationScreen } from "./generation-screen";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { createChild, getMomotaroStoryId } from "@/app/(main)/create/actions";
import { toast } from "sonner";
import posthog from "posthog-js";

type Step = "info" | "photo" | "generating";

export function CreateFlow() {
  const [step, setStep] = useState<Step>("info");
  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [characterVersionId, setCharacterVersionId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleChildInfoSubmit(name: string, birthYear: number) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("birth_year", String(birthYear));

      const result = await createChild(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setChildId(result.data.id);
      setChildName(name);
      setStep("photo");
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleFileClear = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  async function handleUploadAndGenerate() {
    if (!selectedFile || !childId) return;

    setIsLoading(true);
    try {
      posthog.capture("photo_uploaded");

      const uploadForm = new FormData();
      uploadForm.set("file", selectedFile);
      uploadForm.set("child_id", childId);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        toast.error(uploadData.error ?? "Failed to upload photo");
        return;
      }

      const photoId = uploadData.data.id;

      const storyResult = await getMomotaroStoryId();
      if (!storyResult.success) {
        toast.error(storyResult.error);
        return;
      }

      posthog.capture("character_generation_started");

      const genRes = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: childId,
          photo_id: photoId,
          story_id: storyResult.data,
        }),
      });
      const genData = await genRes.json();

      if (!genRes.ok || !genData.success) {
        toast.error(genData.error ?? "Failed to start generation");
        return;
      }

      setCharacterVersionId(genData.data.character_version_id);
      setStep("generating");
    } finally {
      setIsLoading(false);
    }
  }

  function handleRetry() {
    setCharacterVersionId(null);
    setStep("photo");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center">
      <div className="mb-8 flex w-full justify-center">
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 px-6 py-3 text-sm text-muted-foreground backdrop-blur-sm">
          {["Child Info", "Upload Photo", "Generate"].map((label, i) => {
            const stepKeys: Step[] = ["info", "photo", "generating"];
            const isActive = stepKeys.indexOf(step) >= i;
            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={`h-px w-8 ${isActive ? "bg-warm-accent" : "bg-border"}`}
                  />
                )}
                <span
                  className={
                    isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full rounded-xl border border-border/60 bg-background/90 px-6 py-8 shadow-sm backdrop-blur-sm md:px-10 md:py-10">
        {step === "info" && (
          <div>
            <h2 className="mb-2 font-display text-2xl font-semibold">
              Tell us about your child
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Your child will begin their first adventure in our first story:
              Momotaro.
            </p>
            <ChildInfoForm
              onSubmit={handleChildInfoSubmit}
              isLoading={isLoading}
            />
          </div>
        )}

        {step === "photo" && (
          <div>
            <h2 className="mb-2 font-display text-2xl font-semibold">
              Upload a photo of {childName}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Please upload a photo that clearly shows one child&apos;s face.
            </p>
            <PhotoUpload
              onFileSelected={handleFileSelected}
              onClear={handleFileClear}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              disabled={isLoading}
            />
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("info")}
                disabled={isLoading}
                className="h-12"
              >
                <ArrowLeft className="mr-2 size-4" data-icon="inline-start" />
                Back
              </Button>
              <Button
                onClick={handleUploadAndGenerate}
                disabled={!selectedFile || isLoading}
                className="h-12 flex-1"
                size="lg"
              >
                {isLoading ? "Uploading..." : "Create Character"}
                {!isLoading && (
                  <ArrowRight className="ml-2 size-4" data-icon="inline-end" />
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "generating" && characterVersionId && (
          <GenerationScreen
            characterVersionId={characterVersionId}
            childName={childName}
            onRetry={handleRetry}
          />
        )}
      </div>
    </div>
  );
}
