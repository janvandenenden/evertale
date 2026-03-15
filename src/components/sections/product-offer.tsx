import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/commerce/product-card";
import { cn } from "@/lib/utils";
import { type ProductKey } from "@/lib/stripe/products";
import { ArrowRight } from "lucide-react";

const PRODUCT_KEYS: ProductKey[] = [
  "personalized_book",
  "founding_family_edition",
];

export function ProductOffer() {
  return (
    <section
      id="pricing"
      className="overflow-visible bg-muted/40 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Reserve Your Momotaro Book
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Reserve your child&apos;s personalized Momotaro storybook. Create
            the character for free, only pay when you love it.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
          {PRODUCT_KEYS.map((productKey) => {
            const isFeatured = productKey === "founding_family_edition";
            return (
              <ProductCard
                key={productKey}
                productKey={productKey}
                highlighted={isFeatured}
                className={cn(
                  "h-full overflow-visible flex flex-col",
                  isFeatured &&
                    "border-pop/30 shadow-lg shadow-pop/5 ring-2 ring-pop/20",
                )}
              >
                <Button
                  asChild
                  size="lg"
                  className={`h-11 w-full mt-auto ${
                    isFeatured
                      ? ""
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <Link href="/create">
                    Get Started
                    <ArrowRight
                      className="ml-2 size-4"
                      data-icon="inline-end"
                    />
                  </Link>
                </Button>
              </ProductCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
