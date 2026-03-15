import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function claimFoundingEdition(): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("claim_founding_edition");

  if (error) {
    throw new Error(`Failed to claim founding edition: ${error.message}`);
  }

  return data as boolean;
}

export async function getFoundingEditionCount(): Promise<{
  count: number;
  max: number;
}> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("founding_edition_counter")
    .select("count, max_count")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error("Failed to get founding edition count");
  }

  return { count: data.count, max: data.max_count };
}
