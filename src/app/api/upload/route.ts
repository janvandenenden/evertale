import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { uploadToR2, buildStorageKey } from "@/lib/storage/r2";
import { validatePhotoMetadata } from "@/lib/validators/photo";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const childId = formData.get("child_id") as string | null;

  if (!file || !childId) {
    return NextResponse.json(
      { error: "Missing file or child_id" },
      { status: 400 }
    );
  }

  const validation = validatePhotoMetadata(file.type, file.size);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: child } = await supabase
    .from("children")
    .select("id, user_id")
    .eq("id", childId)
    .eq("user_id", dbUser.id)
    .single();

  if (!child) {
    return NextResponse.json(
      { error: "Child not found or not owned by user" },
      { status: 404 }
    );
  }

  const storageKey = buildStorageKey("uploads", dbUser.id, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const imageUrl = await uploadToR2(storageKey, buffer, file.type);

  const { data: photo, error } = await supabase
    .from("child_photos")
    .insert({
      child_id: childId,
      image_url: imageUrl,
      storage_key: storageKey,
    })
    .select("id, image_url")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to save photo record" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: photo });
}
