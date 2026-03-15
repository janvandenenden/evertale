import { Hero } from "@/components/sections/hero";
import { ExampleExperience } from "@/components/sections/example-experience";
import { ReadingMoment } from "@/components/sections/reading-moment";
import { HowItWorks } from "@/components/sections/how-it-works";
import { ProductOffer } from "@/components/sections/product-offer";
import { FirstStory } from "@/components/sections/first-story";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <ExampleExperience />
      <ReadingMoment />
      <HowItWorks />
      <FirstStory />
      <ProductOffer />
    </main>
  );
}
