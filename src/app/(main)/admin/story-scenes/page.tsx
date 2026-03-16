import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdminClerkUserId } from "@/lib/admin";
import { AdminStoryScenesClient } from "@/app/(main)/admin/story-scenes/admin-story-scenes-client";
import { getCharacterVersionsWithSheets } from "./actions";

export default async function AdminStoryScenesPage() {
  const { userId } = await auth();
  if (!userId || !isAdminClerkUserId(userId)) {
    redirect("/");
  }

  const versionsResult = await getCharacterVersionsWithSheets();
  const characterVersions = versionsResult.success ? versionsResult.data : [];

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">
          Admin: Story Scene Generation
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a story and character, then generate or reroll panels.
          Promote approved panels to save them to the character version.
        </p>

        <AdminStoryScenesClient
          characterVersions={characterVersions}
        />
      </div>
    </main>
  );
}
