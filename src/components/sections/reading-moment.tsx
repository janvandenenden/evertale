import Image from "next/image";

export function ReadingMoment() {
  return (
    <section className="overflow-hidden bg-muted/50 lg:grid lg:min-h-[480px] lg:grid-cols-5">
      <div className="relative h-[280px] w-full lg:col-span-2 lg:h-full lg:min-h-[480px]">
        <Image
          src="/bedtime-story.jpeg"
          alt="A parent reading to their child at bedtime"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 40vw"
          priority
        />
      </div>
      <div className="py-12 lg:col-span-3 lg:flex lg:items-center lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.5rem]">
              A bedtime story they will never forget
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Imagine their face when they open a real hardcover book and see
              themselves inside the story. This is the kind of moment families
              remember forever.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Whether it is a parent reading at bedtime or a grandparent
              sharing a story from far away, Evertale turns a simple moment
              into something extraordinary.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
