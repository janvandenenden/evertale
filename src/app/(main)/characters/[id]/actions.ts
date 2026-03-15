"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

export async function getDownloadUrl(
  characterVersionId: string
): Promise<ActionResult<string>> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = createServerSupabaseClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!dbUser) {
    return { success: false, error: "User not found" };
  }

  const { data: charVersion } = await supabase
    .from("character_versions")
    .select("child_id")
    .eq("id", characterVersionId)
    .single();

  if (!charVersion) {
    return { success: false, error: "Character not found" };
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

  const { data: coverScene } = await supabase
    .from("character_version_scenes")
    .select("image_url")
    .eq("character_version_id", characterVersionId)
    .eq("scene_id", "cover")
    .single();

  if (!coverScene?.image_url) {
    return { success: false, error: "No preview available" };
  }

  return { success: true, data: coverScene.image_url };
}
