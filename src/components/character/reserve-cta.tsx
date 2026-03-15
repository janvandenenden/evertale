"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";
import { ProductCard } from "@/components/commerce/product-card";
import { type ProductKey } from "@/lib/stripe/products";

interface ReserveCtaProps {
  characterVersionId: string;
  selectedProduct?: ProductKey;
}

const OTHER_OPTION: Record<ProductKey, { key: ProductKey; label: string }> = {
  founding_family_edition: {
    key: "personalized_book",
    label: "-> select only the book",
  },
  personalized_book: {
    key: "founding_family_edition",
    label: "-> select Founding Family Edition",
  },
};

export function ReserveCta({
  characterVersionId,
  selectedProduct = "founding_family_edition",
}: ReserveCtaProps) {
  function handleSelect(productType: ProductKey) {
    posthog.capture("reserve_book_clicked", {
      character_version_id: characterVersionId,
      product_type: productType,
    });
  }

  const other = OTHER_OPTION[selectedProduct];

  return (
    <section className="space-y-4">
      <div className="w-full flex justify-between items-center">
        <p className="text-sm font-medium tracking-widest text-warm-accent uppercase">
          What you are buying
        </p>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-transparent cursor-pointer pr-0"
        >
          <Link
            href={`/checkout?character_version_id=${characterVersionId}&product=${other.key}`}
            onClick={() => handleSelect(other.key)}
          >
            {other.label}
          </Link>
        </Button>
      </div>

      <ProductCard
        productKey={selectedProduct}
        highlighted
        className="shadow-sm"
      />
    </section>
  );
}
