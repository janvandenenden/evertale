"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { ImageIcon } from "lucide-react";

interface CharacterRevealProps {
  previewImageUrl: string | null;
  childName: string;
  characterVersionId: string;
}

export function CharacterReveal({
  previewImageUrl,
  childName,
  characterVersionId,
}: CharacterRevealProps) {
  useEffect(() => {
    posthog.capture("character_viewed", {
      character_version_id: characterVersionId,
    });
  }, [characterVersionId]);

  if (!previewImageUrl) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-border/60 bg-warm/30">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="mx-auto size-12 opacity-40" />
          <p className="mt-3 text-sm">Preview is being generated...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="overflow-hidden rounded-2xl border border-border/60 shadow-xl shadow-warm-accent/10">
        <img
          src={previewImageUrl}
          alt={`${childName}'s hero poster`}
          className="w-full object-cover"
        />
      </div>
    </div>
  );
}
