import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdminClerkUserId } from "@/lib/admin";
import { getCharacterVersions } from "./actions";
import { BookPreviewClient } from "./book-preview-client";

export default async function BookPreviewPage() {
  const { userId } = await auth();
  if (!userId || !isAdminClerkUserId(userId)) {
    redirect("/");
  }

  const versionsResult = await getCharacterVersions();
  const versions = versionsResult.success ? versionsResult.data : [];

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">
          Admin: Book Preview &amp; PDF Generation
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Preview the complete book layout and generate a print-ready interior
          PDF for Lulu.
        </p>

        <BookPreviewClient characterVersions={versions} />
      </div>
    </main>
  );
}
