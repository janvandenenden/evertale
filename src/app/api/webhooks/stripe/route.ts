import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { triggerPostReservationGeneration } from "@/lib/admin/post-reservation-generation";
import type { ProductType } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripeClient();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;

    if (!metadata) {
      return NextResponse.json({ received: true });
    }

    const supabase = createServerSupabaseClient();

    const sessionAny = session as unknown as Record<string, unknown>;
    const shippingDetails = sessionAny.shipping_details as
      | { name?: string; address?: Record<string, string | null> }
      | null
      | undefined;
    const address = shippingDetails?.address;

    const { error } = await supabase.from("orders").insert({
      user_id: metadata.user_id,
      child_id: metadata.child_id,
      character_version_id: metadata.character_version_id,
      story_id: metadata.story_id,
      stripe_session_id: session.id,
      product_type: metadata.product_type as ProductType,
      price_cents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "paid",
      shipping_name: shippingDetails?.name ?? null,
      shipping_line1: address?.line1 ?? null,
      shipping_line2: address?.line2 ?? null,
      shipping_city: address?.city ?? null,
      shipping_postal_code: address?.postal_code ?? null,
      shipping_country: address?.country ?? null,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const { data: child } = await supabase
      .from("children")
      .select("name")
      .eq("id", metadata.child_id)
      .single();

    const { data: story } = await supabase
      .from("stories")
      .select("slug")
      .eq("id", metadata.story_id)
      .single();

    if (child && story) {
      triggerPostReservationGeneration(
        supabase,
        metadata.character_version_id as string,
        child.name,
        story.slug
      ).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}
