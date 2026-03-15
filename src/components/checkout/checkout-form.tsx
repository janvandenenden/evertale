"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PRODUCTS, type ProductKey } from "@/lib/stripe/products";
import { createCheckoutSession } from "@/app/checkout/actions";
import { toast } from "sonner";
import { Loader2, ShoppingBag } from "lucide-react";

interface CheckoutFormProps {
  characterVersionId: string;
  productKey: ProductKey;
}

export function CheckoutForm({
  characterVersionId,
  productKey,
}: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const product = PRODUCTS[productKey];

  async function handleCheckout() {
    setIsLoading(true);
    try {
      const result = await createCheckoutSession(
        characterVersionId,
        productKey,
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      window.location.href = result.data.url;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4 border-t border-border/60 pt-6 mt-auto">
      <p className="text-xs text-muted-foreground">
        Books are expected to ship after the Momotaro launch in May.
      </p>

      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full h-12"
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <ShoppingBag className="mr-2 size-4" data-icon="inline-start" />
        )}
        {isLoading ? "Redirecting to payment..." : "Proceed to checkout"}
      </Button>

      <p className="text-xs text-muted-foreground">
        You&apos;re checking out the {product.name.toLowerCase()} package.
      </p>
    </div>
  );
}
