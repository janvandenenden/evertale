import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerSupabaseClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: charVersion } = await supabase
    .from("character_versions")
    .select("id, status, last_error, child_id")
    .eq("id", id)
    .single();

  if (!charVersion) {
    return NextResponse.json(
      { error: "Character version not found" },
      { status: 404 }
    );
  }

  const { data: child } = await supabase
    .from("children")
    .select("user_id")
    .eq("id", charVersion.child_id)
    .eq("user_id", dbUser.id)
    .single();

  if (!child) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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

  return NextResponse.json({
    success: true,
    data: {
      id: charVersion.id,
      status: charVersion.status,
      character_sheets: characterSheets ?? [],
      scenes: scenes ?? [],
      last_error: charVersion.last_error,
    },
  });
}
