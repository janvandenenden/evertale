import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OrderConfirmationPage({
  searchParams,
}: PageProps) {
  const { session_id } = await searchParams;
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const supabase = createServerSupabaseClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!dbUser) redirect("/login");

  let orderInfo: {
    childName: string;
    productType: string;
    previewUrl: string | null;
  } | null = null;

  if (session_id) {
    const { data: order } = await supabase
      .from("orders")
      .select(
        "product_type, character_version_id, children!inner(name)"
      )
      .eq("stripe_session_id", session_id)
      .eq("user_id", dbUser.id)
      .single();

    if (order) {
      const child = order.children as unknown as { name: string };

      const { data: coverScene } = await supabase
        .from("character_version_scenes")
        .select("image_url")
        .eq("character_version_id", order.character_version_id)
        .eq("scene_id", "cover")
        .single();

      orderInfo = {
        childName: child.name,
        productType: order.product_type,
        previewUrl: coverScene?.image_url ?? null,
      };
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="size-8 text-green-600" />
        </div>

        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {orderInfo
            ? `${orderInfo.childName}'s Story Is Reserved`
            : "Your Story Is Reserved"}
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          Thank you for your order! Your personalized book is being prepared.
          Books are expected to ship after the Momotaro launch in May.
        </p>

        {orderInfo?.previewUrl && (
          <div className="mt-8 overflow-hidden rounded-xl border border-border/60 shadow-lg">
            <img
              src={orderInfo.previewUrl}
              alt={`${orderInfo.childName}'s story character`}
              className="w-full object-cover"
            />
          </div>
        )}

        {orderInfo?.productType === "founding_family_edition" && (
          <p className="mt-6 text-sm font-medium text-warm-accent">
            Welcome to the Founding Family! Your exclusive extras will be
            included with your order.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/create">Create Another Character</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
