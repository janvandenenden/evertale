"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createChildSchema } from "@/lib/schemas";
import type { ActionResult, Child } from "@/lib/types";

const MAX_CHILDREN_PER_ACCOUNT = 3;

export async function ensureUser(): Promise<
  ActionResult<{ id: string; clerk_user_id: string }>
> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = createServerSupabaseClient();

  const { data: existing } = await supabase
    .from("users")
    .select("id, clerk_user_id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (existing) {
    return { success: true, data: existing };
  }

  // For email, we would normally get it from Clerk's user object.
  // Using a placeholder since we only need the clerk_user_id for matching.
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({ clerk_user_id: clerkUserId, email: "" })
    .select("id, clerk_user_id")
    .single();

  if (error || !newUser) {
    return { success: false, error: "Failed to create user record" };
  }

  return { success: true, data: newUser };
}

export async function createChild(
  formData: FormData
): Promise<ActionResult<Child>> {
  const userResult = await ensureUser();
  if (!userResult.success) {
    return { success: false, error: userResult.error };
  }

  const raw = {
    name: formData.get("name") as string,
    birth_year: Number(formData.get("birth_year")),
  };

  const parsed = createChildSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: msg };
  }

  const supabase = createServerSupabaseClient();

  const { count } = await supabase
    .from("children")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userResult.data.id);

  if ((count ?? 0) >= MAX_CHILDREN_PER_ACCOUNT) {
    return {
      success: false,
      error: `You can have up to ${MAX_CHILDREN_PER_ACCOUNT} children per account.`,
    };
  }

  const { data: child, error } = await supabase
    .from("children")
    .insert({
      user_id: userResult.data.id,
      name: parsed.data.name,
      birth_year: parsed.data.birth_year,
    })
    .select()
    .single();

  if (error || !child) {
    return { success: false, error: "Failed to create child profile" };
  }

  return { success: true, data: child as Child };
}

export async function getUserChildren(): Promise<ActionResult<Child[]>> {
  const userResult = await ensureUser();
  if (!userResult.success) {
    return { success: false, error: userResult.error };
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("children")
    .select()
    .eq("user_id", userResult.data.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "Failed to fetch children" };
  }

  return { success: true, data: (data ?? []) as Child[] };
}

export async function getMomotaroStoryId(): Promise<ActionResult<string>> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", "momotaro")
    .single();

  if (error || !data) {
    return { success: false, error: "Momotaro story not found" };
  }

  return { success: true, data: data.id };
}
