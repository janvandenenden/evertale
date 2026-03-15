import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChildCard } from "@/components/dashboard/child-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { CharacterStatus } from "@/lib/types";

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const supabase = createServerSupabaseClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!dbUser) redirect("/login");

  const { data: children } = await supabase
    .from("children")
    .select("id, name, birth_year")
    .eq("user_id", dbUser.id)
    .order("created_at", { ascending: false });

  const childIds = (children ?? []).map((c) => c.id);

  const charactersByChild: Record<
    string,
    { id: string; status: CharacterStatus; preview_image_url: string | null }
  > = {};

  if (childIds.length > 0) {
    const { data: charVersions } = await supabase
      .from("character_versions")
      .select("id, child_id, status")
      .in("child_id", childIds)
      .order("created_at", { ascending: false });

    const charVersionIds = (charVersions ?? []).map((cv) => cv.id);
    const coverByVersion: Record<string, string> = {};

    if (charVersionIds.length > 0) {
      const { data: coverScenes } = await supabase
        .from("character_version_scenes")
        .select("character_version_id, image_url")
        .eq("scene_id", "cover")
        .in("character_version_id", charVersionIds);

      for (const s of coverScenes ?? []) {
        coverByVersion[s.character_version_id] = s.image_url;
      }
    }

    if (charVersions) {
      for (const cv of charVersions) {
        if (!charactersByChild[cv.child_id]) {
          charactersByChild[cv.child_id] = {
            id: cv.id,
            status: cv.status as CharacterStatus,
            preview_image_url: coverByVersion[cv.id] ?? null,
          };
        }
      }
    }
  }

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your children and their story characters.
            </p>
          </div>
          {(children ?? []).length > 0 && (children ?? []).length < 3 && (
            <Button asChild size="sm">
              <Link href="/create">
                <Plus className="mr-1.5 size-4" data-icon="inline-start" />
                New Character
              </Link>
            </Button>
          )}
        </div>

        {(children ?? []).length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(children ?? []).map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                latestCharacter={charactersByChild[child.id] ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
