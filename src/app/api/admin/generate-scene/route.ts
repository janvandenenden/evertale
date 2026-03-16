import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminClerkUserId } from "@/lib/admin";
import { generateStoryScenePanel } from "@/lib/replicate/generate-story-scene";
import { getScenePromptForGeneration } from "@/lib/prompts/story-scene";
import { getWorkspaceWithGenerations } from "@/app/(main)/admin/story-scenes/actions";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdminClerkUserId(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const workspaceId = body?.workspace_id;
  const sceneId = body?.scene_id;

  if (!workspaceId || !sceneId || typeof workspaceId !== "string" || typeof sceneId !== "string") {
    return NextResponse.json(
      { error: "Invalid request", success: false },
      { status: 400 }
    );
  }

  const workspaceResult = await getWorkspaceWithGenerations(workspaceId);
  if (!workspaceResult.success) {
    return NextResponse.json(
      { error: workspaceResult.error },
      { status: 404 }
    );
  }
  const { workspace } = workspaceResult.data;
  const promptResult = getScenePromptForGeneration(
    "momotaro",
    sceneId,
    workspace.childName
  );

  if (!promptResult) {
    return NextResponse.json(
      { error: "Scene not found or unsupported" },
      { status: 400 }
    );
  }

  const characterSheetUrl = workspace.sheetsByPhase[promptResult.phase];
  if (!characterSheetUrl) {
    return NextResponse.json(
      { error: `No character sheet for phase "${promptResult.phase}"` },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();

  try {
    await generateStoryScenePanel({
      supabase,
      workspaceId,
      sceneId,
      prompt: promptResult.prompt,
      characterSheetUrl,
      templateUrl: promptResult.templateUrl,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json(
      { error: message, success: false },
      { status: 500 }
    );
  }
}
