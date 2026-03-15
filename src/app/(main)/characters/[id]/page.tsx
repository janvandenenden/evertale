import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { CharacterPreviewPanel } from "@/components/character/character-preview-panel";
import { CharacterActions } from "@/components/character/character-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CharacterPage({ params }: PageProps) {
  const { id } = await params;
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const supabase = createServerSupabaseClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!dbUser) redirect("/login");

  const { data: charVersion } = await supabase
    .from("character_versions")
    .select("*, children!inner(name, user_id), stories!inner(title, slug)")
    .eq("id", id)
    .single();

  if (!charVersion) notFound();

  const child = charVersion.children as unknown as {
    name: string;
    user_id: string;
  };

  if (child.user_id !== dbUser.id) notFound();

  const story = charVersion.stories as unknown as {
    title: string;
    slug: string;
  };

  let sourcePhotoUrl: string | null = null;
  if (charVersion.source_photo_id) {
    const { data: photo } = await supabase
      .from("child_photos")
      .select("image_url")
      .eq("id", charVersion.source_photo_id)
      .single();
    sourcePhotoUrl = photo?.image_url ?? null;
  }

  const { data: characterSheets } = await supabase
    .from("character_sheets")
    .select("phase, image_url")
    .eq("character_version_id", id)
    .order("phase");

  const { data: scenes } = await supabase
    .from("character_version_scenes")
    .select("scene_id, image_url")
    .eq("character_version_id", id)
    .order("scene_id");

  return (
    <main className="flex-1">
      {charVersion.status === "failed" ? (
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold">
              Something went wrong
            </h1>
            <p className="mt-3 text-muted-foreground">
              {charVersion.last_error ?? "Character generation failed."}
            </p>
            <a
              href="/create"
              className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Try Again
            </a>
          </div>
        </div>
      ) : (
        <div className="grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(20rem,36rem)_minmax(0,1fr)]">
          <div className="border-b border-border/60 lg:border-r lg:border-b-0">
            <div className="mx-auto flex h-full w-full max-w-6xl justify-center px-6 py-10 md:px-8 md:py-12 lg:justify-end lg:px-10 lg:py-16">
              <div className="w-full max-w-xl space-y-8">
                <div className="space-y-3 text-center lg:text-left">
                  <p className="text-sm font-medium tracking-widest text-warm-accent uppercase">
                    {story.title}
                  </p>
                  <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                    Meet {child.name}&apos;s Story Character
                  </h1>
                </div>

                {charVersion.status === "completed" ? (
                  <CharacterActions
                    characterVersionId={charVersion.id}
                    childId={charVersion.child_id}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your character is being generated. This usually takes about
                    20 seconds.
                  </p>
                )}
              </div>
            </div>
          </div>

          <CharacterPreviewPanel
            characterSheets={characterSheets ?? []}
            scenes={scenes ?? []}
            sourcePhotoUrl={sourcePhotoUrl}
            childName={child.name}
            showOverlay={true}
          />
        </div>
      )}
    </main>
  );
}
