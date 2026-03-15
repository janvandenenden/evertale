import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { runCharacterPipeline } from "@/lib/replicate/run-character-pipeline";

const MAX_GENERATIONS_PER_CHILD = 3;

export async function POST(request: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const characterVersionId = body?.character_version_id;
  if (!characterVersionId || typeof characterVersionId !== "string") {
    return NextResponse.json(
      { error: "Invalid request", success: false },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("character_versions")
    .select("id, child_id, story_id, source_photo_id")
    .eq("id", characterVersionId)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: "Character version not found" },
      { status: 404 }
    );
  }

  const { data: child } = await supabase
    .from("children")
    .select("id, name, user_id")
    .eq("id", existing.child_id)
    .single();

  if (!child || child.user_id !== dbUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: photo } = await supabase
    .from("child_photos")
    .select("id, image_url")
    .eq("id", existing.source_photo_id)
    .single();

  if (!photo) {
    return NextResponse.json(
      { error: "Source photo not found" },
      { status: 404 }
    );
  }

  const { count } = await supabase
    .from("character_versions")
    .select("id", { count: "exact", head: true })
    .eq("child_id", existing.child_id)
    .neq("status", "failed");

  if ((count ?? 0) >= MAX_GENERATIONS_PER_CHILD) {
    return NextResponse.json(
      { error: "Maximum generations reached for this child", success: false },
      { status: 429 }
    );
  }

  const { data: newVersion, error: insertError } = await supabase
    .from("character_versions")
    .insert({
      child_id: existing.child_id,
      story_id: existing.story_id,
      source_photo_id: existing.source_photo_id,
      status: "pending",
      generation_count: 0,
    })
    .select("id")
    .single();

  if (insertError || !newVersion) {
    return NextResponse.json(
      { error: "Failed to create character version", success: false },
      { status: 500 }
    );
  }

  runCharacterPipeline(
    supabase,
    newVersion.id,
    child.name as string,
    dbUser.id,
    photo.image_url
  );

  return NextResponse.json({
    success: true,
    data: { character_version_id: newVersion.id },
  });
}
