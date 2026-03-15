"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import posthog from "posthog-js";

export function Hero() {
  function handleCtaClick() {
    posthog.capture("hero_cta_click");
  }

  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div className="absolute inset-0 right-0 md:left-auto md:w-[58%] lg:w-[56%]">
        <Image
          src="/hero-example-with-cover.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[42%_center] md:object-[34%_center] lg:object-[38%_center]"
        />
        <div className="absolute inset-0 bg-background/12 md:bg-background/0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/72 via-background/42 to-background/88 md:hidden" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/78 via-background/32 to-background/8 md:hidden" />
        <div className="absolute inset-0 hidden md:block bg-gradient-to-b from-background/18 via-transparent to-background/72" />
        <div className="absolute inset-0 hidden md:block bg-gradient-to-l from-transparent via-background/10 to-background" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 md:pb-28 md:pt-32">
        <div className="max-w-2xl">
          <div className="mx-auto max-w-xl text-center md:mx-0 md:max-w-none md:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pop/20 bg-pop-muted px-4 py-1.5 text-sm text-foreground">
              <Sparkles className="size-3.5 text-pop" />
              Now available: Momotaro, The Peach Boy
            </div>

            <h1 className="mx-auto max-w-[9ch] font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:mx-0 md:max-w-[10ch] md:text-5xl lg:text-6xl">
              Your Child, the Hero of the Story
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:mx-0 md:text-xl">
              Turn a photo of your child into a beautifully illustrated
              storybook character. A one-of-a-kind hardcover book they will
              treasure forever.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:items-center md:justify-start">
              <Button
                asChild
                size="lg"
                className="h-12 px-6 text-base"
                onClick={handleCtaClick}
              >
                <Link href="/create">
                  Create Your Child&apos;s Character
                  <ArrowRight className="ml-2 size-4" data-icon="inline-end" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-12 px-6 text-base text-muted-foreground"
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
