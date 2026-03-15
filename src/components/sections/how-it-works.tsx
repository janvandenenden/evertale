import { Camera, Sparkles, BookOpen, Package } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Upload a Photo",
    description: "Share a clear photo of your child. We handle the rest.",
  },
  {
    icon: Sparkles,
    title: "We Create Their Character",
    description:
      "Our AI transforms the photo into a beautiful watercolor storybook character.",
  },
  {
    icon: BookOpen,
    title: "Your Child Enters the Story",
    description:
      "See your child as the hero, surrounded by story characters in a hand-painted scene.",
  },
  {
    icon: Package,
    title: "A Hardcover Book Arrives",
    description:
      "A premium hardcover book, printed and shipped to your door.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From photo to printed book in four simple steps.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-border to-transparent lg:block" />
              )}
              <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted shadow-sm ring-1 ring-border">
                <step.icon className="size-6 text-pop" />
              </div>
              <div className="mb-2 text-xs font-medium tracking-widest uppercase text-muted-foreground/60">
                Step {index + 1}
              </div>
              <h3 className="font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
