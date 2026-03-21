"use client";

import Image from "next/image";
import type { R2Object } from "@/lib/storage/list-r2";
import type { TextPageTemplate } from "@/lib/text-pages/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
  readonly images: R2Object[];
  readonly templates: TextPageTemplate[];
  readonly selectedKey: string | null;
  readonly onSelect: (image: R2Object) => void;
}

function getFileName(key: string): string {
  return key.split("/").pop() ?? key;
}

export function ImagePicker({
  images,
  templates,
  selectedKey,
  onSelect,
}: ImagePickerProps) {
  const templateKeys = new Set(templates.map((t) => t.imageKey));

  if (images.length === 0) {
    return (
      <div className="rounded border border-dashed p-8 text-center text-sm text-muted-foreground">
        No images found. Upload images to R2 under the{" "}
        <code>momotaro/text-pages/</code> prefix.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      {images.map((image) => {
        const hasTemplate = templateKeys.has(image.key);
        const isSelected = selectedKey === image.key;

        return (
          <button
            key={image.key}
            type="button"
            onClick={() => onSelect(image)}
            className={cn(
              "group relative overflow-hidden rounded border-2 transition-colors",
              isSelected
                ? "border-primary ring-2 ring-primary/30"
                : "border-transparent hover:border-muted-foreground/30"
            )}
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={image.url}
                alt={getFileName(image.key)}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
            {hasTemplate && (
              <Badge
                variant="secondary"
                className="absolute right-1 top-1 text-[10px]"
              >
                Has template
              </Badge>
            )}
            <p className="truncate px-1 py-0.5 text-[10px] text-muted-foreground">
              {getFileName(image.key)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
