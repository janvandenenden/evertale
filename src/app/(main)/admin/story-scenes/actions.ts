"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminClerkUserId } from "@/lib/admin";
import { getStoryConfig } from "@/lib/stories";
import type { ActionResult } from "@/lib/types";

async function requireAdmin(): Promise<{ clerkUserId: string }> {
  const { userId } = await auth();
  if (!userId || !isAdminClerkUserId(userId)) {
    throw new Error("Forbidden");
  }
  return { clerkUserId: userId };
}

export async function getCharacterVersionsWithSheets(): Promise<
  ActionResult<
    Array<{
      characterVersionId: string;
      childName: string;
      storySlug: string;
      sheets: Array<{ id: string; phase: string; imageUrl: string }>;
    }>
  >
> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden" };
  }

  const supabase = createServerSupabaseClient();

  const { data: versions, error: versionsError } = await supabase
    .from("character_versions")
    .select(
      `
      id,
      children!inner(name),
      stories!inner(slug)
    `
    )
    .eq("status", "completed");

  if (versionsError || !versions) {
    return { success: false, error: versionsError?.message ?? "Failed to load" };
  }

  const { data: sheets } = await supabase
    .from("character_sheets")
    .select("id, character_version_id, phase, image_url")
    .in(
      "character_version_id",
      versions.map((v) => v.id)
    );

  const byVersion = new Map<
    string,
    Array<{ id: string; phase: string; imageUrl: string }>
  >();
  for (const s of sheets ?? []) {
    const list = byVersion.get(s.character_version_id) ?? [];
    list.push({
      id: s.id,
      phase: s.phase,
      imageUrl: s.image_url,
    });
    byVersion.set(s.character_version_id, list);
  }

  const result = versions.map((v) => {
    const child = v.children as unknown as { name: string };
    const story = v.stories as unknown as { slug: string };
    return {
      characterVersionId: v.id,
      childName: child.name,
      storySlug: story.slug,
      sheets: byVersion.get(v.id) ?? [],
    };
  });

  return { success: true, data: result };
}

export async function createOrGetWorkspace(
  storySlug: string,
  characterVersionId: string,
  childName: string
): Promise<ActionResult<{ workspaceId: string }>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden" };
  }

  const supabase = createServerSupabaseClient();

  const config = getStoryConfig(storySlug);
  if (!config) {
    return { success: false, error: "Story config not found" };
  }

  const { data: story } = await supabase
    .from("stories")
    .select("id")
    .eq("slug", storySlug)
    .single();

  if (!story) {
    return { success: false, error: "Story not found" };
  }

  const { data: sheet } = await supabase
    .from("character_sheets")
    .select("id, image_url")
    .eq("character_version_id", characterVersionId)
    .eq("phase", config.coverPhase)
    .single();

  if (!sheet) {
    return { success: false, error: "No character sheet for cover phase" };
  }

  const { data: existing } = await supabase
    .from("admin_story_scene_workspaces")
    .select("id")
    .eq("story_id", story.id)
    .eq("character_version_id", characterVersionId)
    .eq("character_sheet_id", sheet.id)
    .eq("phase", config.coverPhase)
    .single();

  if (existing) {
    return { success: true, data: { workspaceId: existing.id } };
  }

  const { data: created, error } = await supabase
    .from("admin_story_scene_workspaces")
    .insert({
      story_id: story.id,
      character_version_id: characterVersionId,
      character_sheet_id: sheet.id,
      phase: config.coverPhase,
      child_name: childName,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { success: false, error: error?.message ?? "Failed to create workspace" };
  }

  return { success: true, data: { workspaceId: created.id } };
}

export async function getWorkspaceWithGenerations(
  workspaceId: string
): Promise<
  ActionResult<{
    workspace: {
      id: string;
      storyId: string;
      characterVersionId: string;
      phase: string;
      childName: string;
      sheetsByPhase: Record<string, string>;
    };
    generations: Array<{
      sceneId: string;
      status: string;
      imageUrl: string | null;
      error: string | null;
    }>;
  }>
> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden" };
  }

  const supabase = createServerSupabaseClient();

  const { data: workspace, error: wsError } = await supabase
    .from("admin_story_scene_workspaces")
    .select("id, story_id, character_version_id, phase, child_name")
    .eq("id", workspaceId)
    .single();

  if (wsError || !workspace) {
    return { success: false, error: wsError?.message ?? "Workspace not found" };
  }

  const { data: generations } = await supabase
    .from("admin_story_scene_generations")
    .select("scene_id, status, image_url, error")
    .eq("workspace_id", workspaceId);

  const { data: allSheets } = await supabase
    .from("character_sheets")
    .select("phase, image_url")
    .eq("character_version_id", workspace.character_version_id);

  const sheetsByPhase: Record<string, string> = {};
  for (const s of allSheets ?? []) {
    sheetsByPhase[s.phase] = s.image_url;
  }

  return {
    success: true,
    data: {
      workspace: {
        id: workspace.id,
        storyId: workspace.story_id,
        characterVersionId: workspace.character_version_id,
        phase: workspace.phase,
        childName: workspace.child_name,
        sheetsByPhase,
      },
      generations: (generations ?? []).map((g) => ({
        sceneId: g.scene_id,
        status: g.status,
        imageUrl: g.image_url,
        error: g.error,
      })),
    },
  };
}

export async function promotePanel(
  workspaceId: string,
  sceneId: string
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Forbidden" };
  }

  const supabase = createServerSupabaseClient();

  const { data: workspace } = await supabase
    .from("admin_story_scene_workspaces")
    .select("character_version_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    return { success: false, error: "Workspace not found" };
  }

  const { data: gen } = await supabase
    .from("admin_story_scene_generations")
    .select("image_url")
    .eq("workspace_id", workspaceId)
    .eq("scene_id", sceneId)
    .eq("status", "completed")
    .single();

  if (!gen?.image_url) {
    return { success: false, error: "No completed generation to promote" };
  }

  const { error } = await supabase.from("character_version_scenes").upsert(
    {
      character_version_id: workspace.character_version_id,
      scene_id: sceneId,
      image_url: gen.image_url,
    },
    {
      onConflict: "character_version_id,scene_id",
    }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}
