import { StoryFlipbook } from "@/components/story/story-flipbook";

const MOMOTARO_PAGES: string[] = [
  "/momotaro/example-panels/1-river-introduction.jpeg",
  "/momotaro/example-panels/2-peach-appears.jpeg",
  "/momotaro/example-panels/3-carry-peach.jpeg",
  "/momotaro/example-panels/4-examine-peach.jpeg",
  "/momotaro/example-panels/5-peach-opens-b.jpeg",
  "/momotaro/example-panels/6-couple-hold-child.jpeg",
  "/momotaro/example-panels/7-getting-strong.jpeg",
  "/momotaro/example-panels/8-learning-about-ogres.jpeg",
  "/momotaro/example-panels/9-declaring-quest .jpeg",
  "/momotaro/example-panels/10-preparing-dumplings.jpeg",
  "/momotaro/example-panels/11-leaving-home.jpeg",
  "/momotaro/example-panels/12-meeting-the-dog.jpeg",
  "/momotaro/example-panels/13-sharing-the-dumpling.jpeg",
  "/momotaro/example-panels/14-monkey-joins.jpeg",
  "/momotaro/example-panels/15-monkey-get-dumpling.jpeg",
  "/momotaro/example-panels/16-phaesant-joins.jpeg",
  "/momotaro/example-panels/17-phaesant-gets-dumpling.jpeg",
  "/momotaro/example-panels/18-looking-at-island-b.jpeg",
  "/momotaro/example-panels/19-boat-journey.jpeg",
  "/momotaro/example-panels/20-ogre-fortress-b.jpeg",
  "/momotaro/example-panels/21-ogre-infiltration-c.jpeg",
  "/momotaro/example-panels/22-battle-scene.jpeg",
  "/momotaro/example-panels/23-ogres-surrender.jpeg",
  "/momotaro/example-panels/24-take-treasure.jpeg",
  "/momotaro/example-panels/25-saying-goodbye.jpeg",
  "/momotaro/example-panels/26-celebration.jpeg",
  "/momotaro/example-panels/27-peaceful-ending-b.jpeg",
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
