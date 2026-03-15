import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateCharacterSchema } from "@/lib/schemas";
import { runCharacterPipeline } from "@/lib/replicate/run-character-pipeline";

const MAX_GENERATIONS_PER_CHILD = 3;

export async function POST(request: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = generateCharacterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { child_id, photo_id, story_id } = parsed.data;
  const supabase = createServerSupabaseClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: child } = await supabase
    .from("children")
    .select("id, name, user_id")
    .eq("id", child_id)
    .eq("user_id", dbUser.id)
    .single();

  if (!child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  const { data: photo } = await supabase
    .from("child_photos")
    .select("id, image_url")
    .eq("id", photo_id)
    .eq("child_id", child_id)
    .single();

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const { count } = await supabase
    .from("character_versions")
    .select("id", { count: "exact", head: true })
    .eq("child_id", child_id)
    .neq("status", "failed");

  if ((count ?? 0) >= MAX_GENERATIONS_PER_CHILD) {
    return NextResponse.json(
      { error: "Maximum generations reached for this child" },
      { status: 429 }
    );
  }

  const { data: charVersion, error: insertError } = await supabase
    .from("character_versions")
    .insert({
      child_id,
      story_id,
      source_photo_id: photo_id,
      status: "pending",
      generation_count: 0,
    })
    .select("id")
    .single();

  if (insertError || !charVersion) {
    return NextResponse.json(
      { error: "Failed to create character version" },
      { status: 500 }
    );
  }

  runCharacterPipeline(
    supabase,
    charVersion.id,
    child.name,
    dbUser.id,
    photo.image_url
  );

  return NextResponse.json({
    success: true,
    data: { character_version_id: charVersion.id },
  });
}
