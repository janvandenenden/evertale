"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteFromR2 } from "@/lib/storage/r2";
import type { ActionResult } from "@/lib/types";

async function getAuthenticatedUserId(): Promise<string | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  return data?.id ?? null;
}

export async function deleteChild(childId: string): Promise<ActionResult<null>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  const supabase = createServerSupabaseClient();

  const { data: child } = await supabase
    .from("children")
    .select("id, user_id")
    .eq("id", childId)
    .eq("user_id", userId)
    .single();

  if (!child) return { success: false, error: "Child not found" };

  // Collect R2 keys to delete
  const { data: photos } = await supabase
    .from("child_photos")
    .select("storage_key")
    .eq("child_id", childId);

  const { data: charVersions } = await supabase
    .from("character_versions")
    .select("id")
    .eq("child_id", childId);

  const keysToDelete: string[] = [];
  if (photos) {
    for (const p of photos) {
      keysToDelete.push(p.storage_key);
    }
  }

  const publicUrl = process.env.R2_PUBLIC_URL;
  if (charVersions && publicUrl) {
    for (const cv of charVersions) {
      const { data: sheets } = await supabase
        .from("character_sheets")
        .select("image_url")
        .eq("character_version_id", cv.id);
      const { data: scenes } = await supabase
        .from("character_version_scenes")
        .select("image_url")
        .eq("character_version_id", cv.id);
      for (const s of sheets ?? []) {
        if (s.image_url.startsWith(publicUrl)) {
          keysToDelete.push(s.image_url.slice(publicUrl.length + 1));
        }
      }
      for (const sc of scenes ?? []) {
        if (sc.image_url.startsWith(publicUrl)) {
          keysToDelete.push(sc.image_url.slice(publicUrl.length + 1));
        }
      }
    }
  }

  // Delete R2 objects (best-effort, don't block on failures)
  await Promise.allSettled(keysToDelete.map((key) => deleteFromR2(key)));

  // Cascade delete in DB (children -> child_photos, character_versions all cascade)
  const { error } = await supabase
    .from("children")
    .delete()
    .eq("id", childId);

  if (error) return { success: false, error: "Failed to delete child" };

  return { success: true, data: null };
}

export async function deleteCharacter(
  characterVersionId: string
): Promise<ActionResult<null>> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  const supabase = createServerSupabaseClient();

  const { data: cv } = await supabase
    .from("character_versions")
    .select("id, child_id")
    .eq("id", characterVersionId)
    .single();

  if (!cv) return { success: false, error: "Character not found" };

  const { data: child } = await supabase
    .from("children")
    .select("user_id")
    .eq("id", cv.child_id)
    .eq("user_id", userId)
    .single();

  if (!child) return { success: false, error: "Not authorized" };

  const publicUrl = process.env.R2_PUBLIC_URL;
  const keysToDelete: string[] = [];
  if (publicUrl) {
    const { data: sheets } = await supabase
      .from("character_sheets")
      .select("image_url")
      .eq("character_version_id", characterVersionId);
    const { data: scenes } = await supabase
      .from("character_version_scenes")
      .select("image_url")
      .eq("character_version_id", characterVersionId);
    for (const s of sheets ?? []) {
      if (s.image_url.startsWith(publicUrl)) {
        keysToDelete.push(s.image_url.slice(publicUrl.length + 1));
      }
    }
    for (const sc of scenes ?? []) {
      if (sc.image_url.startsWith(publicUrl)) {
        keysToDelete.push(sc.image_url.slice(publicUrl.length + 1));
      }
    }
  }

  await Promise.allSettled(keysToDelete.map((key) => deleteFromR2(key)));

  const { error } = await supabase
    .from("character_versions")
    .delete()
    .eq("id", characterVersionId);

  if (error) return { success: false, error: "Failed to delete character" };

  return { success: true, data: null };
}
