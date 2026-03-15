import Image from "next/image";

export function ReadingMoment() {
  return (
    <section className="relative flex min-h-[400px] overflow-hidden bg-muted/50 py-20 md:py-28 lg:py-0 lg:min-h-[480px]">
      <div className="relative order-2 w-full min-h-[280px] flex-1 self-stretch lg:order-1 lg:min-w-0 lg:basis-[45%]">
        <Image
          src="/bedtime-story.jpeg"
          alt="A parent reading to their child at bedtime"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 45vw"
          priority
        />
      </div>
      <div className="order-1 flex flex-1 flex-col justify-center px-6 lg:order-2 lg:basis-[55%] lg:px-12 lg:py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.5rem]">
          A bedtime story they will never forget
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
          Imagine their face when they open a real hardcover book and see
          themselves inside the story. This is the kind of moment families
          remember forever.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
          Whether it is a parent reading at bedtime or a grandparent sharing a
          story from far away, Evertale turns a simple moment into something
          extraordinary.
        </p>
      </div>
    </section>
  );
}
