"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Scene = { id: string; url: string };

const EXAMPLE_CHILDREN: {
  id: string;
  portrait: string;
  scenes: Scene[];
}[] = [
  {
    id: "black-boy",
    portrait: "/examples/black-boy.png",
    scenes: [
      { id: "getting-strong", url: "/examples/black-boy-getting-strong.jpeg" },
    ],
  },
  {
    id: "black-girl",
    portrait: "/examples/black-girl.png",
    scenes: [
      { id: "getting-strong", url: "/examples/black-girl-getting-strong.jpeg" },
    ],
  },
  {
    id: "blond-girl",
    portrait: "/examples/blond-girl.png",
    scenes: [
      { id: "getting-strong", url: "/examples/blond-girl-getting-strong.jpeg" },
    ],
  },
  {
    id: "east-asian-boy",
    portrait: "/examples/east-asian-boy.png",
    scenes: [
      {
        id: "getting-strong",
        url: "/examples/east-asian-boy-getting-strong.jpeg",
      },
    ],
  },
  {
    id: "east-asian-girl",
    portrait: "/examples/east-asian-girl.png",
    scenes: [
      {
        id: "getting-strong",
        url: "/examples/east-asian-girl-getting-strong.jpeg",
      },
    ],
  },
  {
    id: "indian-boy",
    portrait: "/examples/indian-boy.png",
    scenes: [
      {
        id: "getting-strong",
        url: "/examples/indian-boy-getting-strong.jpeg",
      },
    ],
  },
  {
    id: "mixed-race-boy",
    portrait: "/examples/mixed-race-boy.png",
    scenes: [
      {
        id: "getting-strong",
        url: "/examples/mixed-race-boy-getting-strong.jpeg",
      },
    ],
  },
  {
    id: "red-haired-girl",
    portrait: "/examples/red-haired-girl.png",
    scenes: [
      {
        id: "getting-strong",
        url: "/examples/red-haired-girl-getting-strong.jpeg",
      },
    ],
  },
  {
    id: "white-boy",
    portrait: "/examples/white-boy.png",
    scenes: [
      {
        id: "getting-strong",
        url: "/examples/white-boy-getting-strong.jpeg",
      },
    ],
  },
];

export function ExampleExperience() {
  const [selectedChild, setSelectedChild] = useState(EXAMPLE_CHILDREN[0].id);
  const [sceneIndex, setSceneIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const child = EXAMPLE_CHILDREN.find(
    (exampleChild) => exampleChild.id === selectedChild,
  )!;

  const scenes = child.scenes;
  const hasScenes = scenes.length > 0;
  const hasMultipleScenes = scenes.length > 1;
  const displayImage = hasScenes
    ? scenes[sceneIndex % scenes.length]!.url
    : child.portrait;

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  function handleSelectChild(childId: string) {
    setSelectedChild(childId);
    setSceneIndex(0);
  }

  function showPreviousScene() {
    if (!hasMultipleScenes) return;
    setSceneIndex((i) => (i === 0 ? scenes.length - 1 : i - 1));
  }

  function showNextScene() {
    if (!hasMultipleScenes) return;
    setSceneIndex((i) => (i === scenes.length - 1 ? 0 : i + 1));
  }

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            See the Experience
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose an example child, then preview the personalized story scenes
            they would step into.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          <p>Example children</p>
          <p className="hidden sm:block">Scroll to explore more</p>
        </div>

        <div
          ref={scrollContainerRef}
          className="scroll-fade-x -mx-6 mt-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max snap-x snap-mandatory gap-3 pr-6">
            {EXAMPLE_CHILDREN.map((exampleChild) => (
              <button
                key={exampleChild.id}
                type="button"
                onClick={() => handleSelectChild(exampleChild.id)}
                className={cn(
                  "group relative w-[132px] cursor-pointer shrink-0 snap-start border border-border/60 bg-background text-left transition-all sm:w-[144px]",
                  selectedChild === exampleChild.id
                    ? "border-foreground"
                    : "opacity-80 hover:opacity-100",
                )}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={exampleChild.portrait}
                    alt="Example child portrait"
                    fill
                    sizes="152px"
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="overflow-hidden border border-border/60 bg-muted">
            <div className="relative aspect-[5/4]">
              <Image
                src={displayImage}
                alt="Story scene preview"
                fill
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 border border-border/60 bg-background p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
                Story scenes
              </p>
              <div className="mt-4 space-y-2">
                {scenes.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No scenes yet
                  </p>
                ) : (
                  scenes.map((scene, index) => (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => setSceneIndex(index)}
                      className={cn(
                        "flex w-full items-center justify-between border border-border/60 px-3 py-3 text-left transition-colors",
                        sceneIndex === index
                          ? "border-foreground bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      <span className="text-sm font-medium capitalize">
                        {scene.id.replace(/-/g, " ")}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.22em]">
                        Scene {index + 1}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {hasScenes && (
              <div className="space-y-3 border-t border-border/60 pt-4">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={showPreviousScene}
                    disabled={!hasMultipleScenes}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={showNextScene}
                    disabled={!hasMultipleScenes}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  {scenes.map((scene, index) => (
                    <button
                      key={scene.id}
                      type="button"
                      aria-label={`Go to scene ${index + 1}`}
                      onClick={() => setSceneIndex(index)}
                      className={cn(
                        "h-1.5 flex-1 border border-foreground/20 transition-colors",
                        sceneIndex === index
                          ? "bg-foreground"
                          : "bg-transparent",
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
