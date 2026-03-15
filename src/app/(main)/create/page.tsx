import Image from "next/image";
import { CreateFlow } from "@/components/create/create-flow";

const MOMOTARO_DECORATIONS = [
  { src: "/hero-example.png", width: 140, className: "top-[8%] left-[2%] -rotate-6 opacity-25" },
  { src: "/examples/east-asian-boy.png", width: 100, className: "top-[12%] right-[4%] rotate-3 opacity-30" },
  { src: "/examples/blond-girl.png", width: 90, className: "top-[28%] left-[15%] -rotate-12 opacity-22" },
  { src: "/examples/mixed-race-boy.png", width: 75, className: "top-[22%] right-[22%] rotate-[-4deg] opacity-20" },
  { src: "/examples/red-haired-girl.png", width: 85, className: "top-[45%] left-[8%] rotate-6 opacity-26" },
  { src: "/hero-example.png", width: 110, className: "top-[42%] right-[12%] -rotate-3 opacity-24" },
  { src: "/examples/white-boy.png", width: 80, className: "top-[55%] left-[25%] rotate-9 opacity-22" },
  { src: "/examples/black-girl.png", width: 85, className: "top-[65%] right-[18%] -rotate-8 opacity-28" },
  { src: "/examples/indian-boy.png", width: 90, className: "bottom-[20%] left-[5%] rotate-4 opacity-25" },
  { src: "/hero-example.png", width: 100, className: "bottom-[15%] right-[8%] -rotate-5 opacity-22" },
];

export default function CreatePage() {
  return (
    <main className="relative flex flex-1 flex-col items-center px-6 py-12 md:py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {MOMOTARO_DECORATIONS.map((d, i) => (
          <div key={i} className={`absolute ${d.className}`}>
            <Image
              src={d.src}
              alt=""
              width={d.width}
              height={Math.round(d.width * 1.25)}
              className="rounded-lg object-cover"
            />
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Create Your Character
          </h1>
          <p className="mt-3 text-muted-foreground">
            In just a few steps, your child becomes the hero of the story.
          </p>
        </div>
        <CreateFlow />
      </div>
    </main>
  );
}
