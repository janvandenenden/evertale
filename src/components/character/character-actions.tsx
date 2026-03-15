"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, RotateCw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";

interface CharacterActionsProps {
  characterVersionId: string;
  childId: string;
}

export function CharacterActions({
  characterVersionId,
  childId,
}: CharacterActionsProps) {
  async function handleReroll() {
    try {
      const res = await fetch("/api/reroll-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character_version_id: characterVersionId }),
      });
      const data = await res.json();
      if (data.success) {
        posthog.capture("character_rerolled", {
          character_version_id: characterVersionId,
        });
        window.location.href = `/characters/${data.data.character_version_id}`;
      } else {
        toast.error(data.error ?? "Failed to regenerate");
      }
    } catch {
      toast.error("Failed to regenerate");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
        <a href="/create">
          <Upload className="mr-2 size-4" />
          Upload new photo
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        onClick={handleReroll}
      >
        <RotateCw className="mr-2 size-4" />
        Regenerate character
      </Button>
      <Button size="lg" className="mt-2 w-full sm:w-auto" asChild>
        <Link
          href={`/checkout?character_version_id=${characterVersionId}&product=founding_family_edition`}
          onClick={() =>
            posthog.capture("reserve_book_clicked", {
              character_version_id: characterVersionId,
              product_type: "founding_family_edition",
            })
          }
        >
          Continue to reserve your book
          <ArrowRight className="ml-2 size-4" data-icon="inline-end" />
        </Link>
      </Button>
    </div>
  );
}
