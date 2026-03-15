import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutPreviewPanel } from "@/components/checkout/checkout-preview-panel";
import { ReserveCta } from "@/components/character/reserve-cta";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PRODUCTS, type ProductKey } from "@/lib/stripe/products";

interface CheckoutPageProps {
  searchParams: Promise<{
    character_version_id?: string;
    product?: string;
  }>;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { character_version_id: characterVersionId, product } =
    await searchParams;

  if (!characterVersionId || !product || !(product in PRODUCTS)) {
    redirect("/");
  }

  const productKey = product as ProductKey;
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/login");
  }

  const supabase = createServerSupabaseClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!dbUser) {
    redirect("/login");
  }

  const { data: charVersion } = await supabase
    .from("character_versions")
    .select("id, status, children!inner(name, user_id), stories!inner(title)")
    .eq("id", characterVersionId)
    .single();

  if (!charVersion) {
    notFound();
  }

  const child = charVersion.children as unknown as {
    name: string;
    user_id: string;
  };

  if (child.user_id !== dbUser.id) {
    notFound();
  }

  const story = charVersion.stories as unknown as {
    title: string;
  };

  if (charVersion.status !== "completed") {
    redirect(`/characters/${characterVersionId}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="grid lg:min-h-[calc(100vh)] lg:grid-cols-[minmax(20rem,36rem)_minmax(0,1fr)]">
          <div className="border-b border-border/60 lg:border-r lg:border-b-0">
            <div className="mx-auto flex h-full w-full max-w-6xl justify-center px-6 py-10 md:px-8 md:py-12 lg:justify-end lg:px-10 lg:py-16">
              <div className="w-full max-w-xl space-y-8 flex flex-col">
                <div className="space-y-3 text-center lg:text-left">
                  <p className="text-sm font-medium tracking-widest text-warm-accent uppercase">
                    {story.title}
                  </p>
                </div>

                <ReserveCta
                  characterVersionId={characterVersionId}
                  selectedProduct={productKey}
                />

                <CheckoutForm
                  characterVersionId={characterVersionId}
                  productKey={productKey}
                />
              </div>
            </div>
          </div>

          <CheckoutPreviewPanel />
        </div>
      </main>
    </div>
  );
}
