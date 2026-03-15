"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";
import { getStripePriceId, PRODUCTS, type ProductKey } from "@/lib/stripe/products";
import { claimFoundingEdition } from "@/lib/stripe/founding-edition";
import type { ActionResult } from "@/lib/types";

export async function createCheckoutSession(
  characterVersionId: string,
  productType: ProductKey
): Promise<ActionResult<{ url: string }>> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "Not authenticated" };
  }

  const product = PRODUCTS[productType];
  if (!product) {
    return { success: false, error: "Invalid product type" };
  }

  const supabase = createServerSupabaseClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, email")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!dbUser) {
    return { success: false, error: "User not found" };
  }

  const { data: charVersion } = await supabase
    .from("character_versions")
    .select("id, child_id, story_id, status")
    .eq("id", characterVersionId)
    .single();

  if (!charVersion || charVersion.status !== "completed") {
    return { success: false, error: "Character not ready for checkout" };
  }

  const { data: child } = await supabase
    .from("children")
    .select("user_id")
    .eq("id", charVersion.child_id)
    .eq("user_id", dbUser.id)
    .single();

  if (!child) {
    return { success: false, error: "Not authorized" };
  }

  if (productType === "founding_family_edition") {
    try {
      const claimed = await claimFoundingEdition();
      if (!claimed) {
        return {
          success: false,
          error:
            "The Founding Family Edition is sold out. Please choose the Personalized Book instead.",
        };
      }
    } catch {
      return {
        success: false,
        error: "Unable to verify Founding Family availability.",
      };
    }
  }

  const stripe = getStripeClient();

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const priceId = getStripePriceId(productType);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "NZ", "JP", "DE", "FR", "NL"],
    },
    metadata: {
      user_id: dbUser.id,
      child_id: charVersion.child_id,
      character_version_id: characterVersionId,
      story_id: charVersion.story_id,
      product_type: productType,
    },
    success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?character_version_id=${characterVersionId}&product=${productType}`,
  });

  if (!session.url) {
    return { success: false, error: "Failed to create checkout session" };
  }

  return { success: true, data: { url: session.url } };
}
