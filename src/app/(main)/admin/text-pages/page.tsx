import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Nunito } from "next/font/google";
import { isAdminClerkUserId } from "@/lib/admin";
import { listTextPageImages, loadExistingTemplates } from "./actions";
import { TextPageEditorClient } from "./text-page-editor-client";
import { momotaroTextPages } from "@/lib/story-assets/momotaro/text-pages";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export default async function AdminTextPagesPage() {
  const { userId } = await auth();
  if (!userId || !isAdminClerkUserId(userId)) {
    redirect("/");
  }

  const [imagesResult, templatesResult] = await Promise.all([
    listTextPageImages("momotaro"),
    loadExistingTemplates(),
  ]);

  const images = imagesResult.success ? imagesResult.data : [];
  const templates = templatesResult.success ? templatesResult.data : [];

  return (
    <main className={`flex-1 ${nunito.variable} bg-gray-50`}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">
          Admin: Text Page Editor
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Place and configure text boxes on story page backgrounds. Copy the
          generated template config into the text-page-templates file.
        </p>

        <TextPageEditorClient
          images={images}
          templates={templates}
          textPages={momotaroTextPages}
        />
      </div>
    </main>
  );
}
