import { BookOpen } from "lucide-react";

export function FirstStory() {
  return (
    <section id="first-story" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-lg">
            <div className="mb-4 text-sm font-medium tracking-widest uppercase text-pop">
              Our First Story
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Momotaro, The Peach Boy
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              A beloved Japanese folktale about a boy born from a giant peach, raised
              by a kind elderly couple. When ogres threaten the land, Momotaro sets
              off on an adventure with his loyal companions: a dog, a monkey, and a
              pheasant.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              In this version, your child takes Momotaro&apos;s place as the hero.
              Every illustration features their character in the watercolor story world.
            </p>
            <p className="mt-6 text-sm text-muted-foreground/70">
              More stories coming soon. Your child&apos;s photo works across all future
              adventures.
            </p>
          </div>

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
                  Story preview spread
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
