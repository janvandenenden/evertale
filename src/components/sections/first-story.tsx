import { StoryFlipbook } from "@/components/story/story-flipbook";

const MOMOTARO_PAGES: string[] = [
  // Add paths once images are placed in public/stories/momotaro/
  // Example: "/stories/momotaro/page-01.jpg"
];

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

          <StoryFlipbook images={MOMOTARO_PAGES} />
        </div>
      </div>
    </section>
  );
}
