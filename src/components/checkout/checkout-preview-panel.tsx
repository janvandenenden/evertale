import Image from "next/image";

export function CheckoutPreviewPanel() {
  return (
    <section className="relative min-h-[55vh] overflow-hidden bg-warm/20">
      <div className="relative h-full w-full">
        <Image
          src="/hero-example.png"
          alt="Story characters waiting for you"
          fill
          className="object-cover object-center"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
      </div>
    </section>
  );
}
