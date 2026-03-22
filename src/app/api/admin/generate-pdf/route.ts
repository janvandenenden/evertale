import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdminClerkUserId } from "@/lib/admin";
import { generateInteriorPdf } from "@/lib/pdf/generate-interior";
import { uploadToR2 } from "@/lib/storage/r2";
import { z } from "zod";

const requestSchema = z.object({
  characterVersionId: z.string().uuid(),
  childName: z.string().min(1).max(100),
  storySlug: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdminClerkUserId(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const pdfBytes = await generateInteriorPdf(parsed.data);

    const sanitizedName = parsed.data.childName
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const filename = `momotaro-interior-${sanitizedName}.pdf`;

    // Upload to R2 for Lulu validation
    const r2Key = `admin/pdfs/${parsed.data.characterVersionId}/${filename}`;
    const r2Url = await uploadToR2(r2Key, pdfBytes, "application/pdf");

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBytes.length),
        "X-R2-Url": r2Url,
        "Access-Control-Expose-Headers": "X-R2-Url",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "PDF generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
