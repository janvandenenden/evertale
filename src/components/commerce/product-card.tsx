"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PRODUCTS, type ProductKey } from "@/lib/stripe/products";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  productKey: ProductKey;
  highlighted?: boolean;
  children?: ReactNode;
  className?: string;
}

export function ProductCard({
  productKey,
  highlighted = false,
  children,
  className,
}: ProductCardProps) {
  const product = PRODUCTS[productKey];

  return (
    <Card
      className={cn(
        "border-border/60 bg-background/95 shadow-sm",
        highlighted && "border-warm-accent/40 ring-2 ring-warm-accent/20",
        className
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="font-display text-lg">{product.name}</CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </div>
          {product.badge_label ? (
            <Badge className="bg-warm-accent text-white hover:bg-warm-accent/90">
              {product.badge_label}
            </Badge>
          ) : null}
        </div>
        <div>
          <p className="font-display text-3xl font-semibold">
            ${(product.price_cents / 100).toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground">One-time reservation</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <ul className="space-y-2.5">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 text-warm-accent" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      {children ? <CardFooter>{children}</CardFooter> : null}
    </Card>
  );
}
