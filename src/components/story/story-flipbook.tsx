"use client";

import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryFlipbookProps {
  images: string[];
}

export function StoryFlipbook({ images }: StoryFlipbookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = images.length;

  const handlePrev = () => {
    setCurrentPage((page) => Math.max(page - 1, 0));
  };

  const handleNext = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages - 1));
  };

  if (images.length === 0) {
    return (
      <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-2xl">
        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted via-background to-muted/50 shadow-lg">
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <BookOpen className="size-12 text-pop/30" />
            <div className="w-full space-y-3">
              <div className="mx-auto h-3 w-3/4 rounded-full bg-muted" />
              <div className="mx-auto h-2 w-1/2 rounded-full bg-muted" />
              <div className="mt-6 aspect-[16/10] rounded-lg bg-muted/70" />
              <div className="mx-auto h-2 w-5/6 rounded-full bg-muted" />
              <div className="mx-auto h-2 w-4/6 rounded-full bg-muted" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Story preview coming soon
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-2xl">
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="relative aspect-[5/4] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[currentPage]}
              alt={`Story page ${currentPage + 1}`}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center justify-between gap-3 px-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <span className="min-w-0 flex-1 text-center text-sm text-muted-foreground">
            {currentPage + 1} of {totalPages}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
