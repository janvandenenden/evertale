"use client";

import React, { forwardRef, useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HTMLFlipBook = dynamic(
  () => import("react-pageflip").then((mod) => mod.default),
  { ssr: false }
);

interface PageProps {
  src: string;
  alt: string;
}

const Page = forwardRef<HTMLDivElement, PageProps>(({ src, alt }, ref) => (
  <div ref={ref} className="overflow-hidden bg-white">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      draggable={false}
    />
  </div>
));
Page.displayName = "Page";

interface StoryFlipbookProps {
  images: string[];
}

export function StoryFlipbook({ images }: StoryFlipbookProps) {
  const flipBookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void; getCurrentPageIndex: () => number; getPageCount: () => number } }>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = images.length;

  const handleFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  const handlePrev = useCallback(() => {
    flipBookRef.current?.pageFlip().flipPrev();
  }, []);

  const handleNext = useCallback(() => {
    flipBookRef.current?.pageFlip().flipNext();
  }, []);

  if (images.length === 0) {
    return (
      <div className="relative mx-auto w-full max-w-md lg:mx-0">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted via-background to-muted/50 shadow-lg">
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
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-xl">
          <HTMLFlipBook
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={flipBookRef as any}
            width={320}
            height={427}
            size="stretch"
            minWidth={200}
            maxWidth={500}
            minHeight={267}
            maxHeight={667}
            drawShadow
            flippingTime={600}
            usePortrait
            startZIndex={0}
            autoSize
            maxShadowOpacity={0.4}
            showCover
            mobileScrollSupport={false}
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            startPage={0}
            className=""
            style={{}}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onFlip={handleFlip as any}
          >
            {images.map((src, i) => (
              <Page key={src} src={src} alt={`Story page ${i + 1}`} />
            ))}
          </HTMLFlipBook>
        </div>

        <div className="flex w-full items-center justify-between px-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <div className="flex items-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 rounded-full transition-all ${
                  i === currentPage
                    ? "w-4 bg-pop"
                    : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

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
