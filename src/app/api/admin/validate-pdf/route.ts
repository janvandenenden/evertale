import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdminClerkUserId } from "@/lib/admin";
import {
  validateInterior,
  getValidationStatus,
  validateCover,
  getCoverValidationStatus,
} from "@/lib/lulu/client";
import { LULU_POD_PACKAGE_ID, INTERIOR_PAGE_COUNT } from "@/lib/pdf/constants";
import { z } from "zod";

const postSchema = z.object({
  sourceUrl: z.string().url(),
  type: z.enum(["interior", "cover"]).default("interior"),
  podPackageId: z.string().optional(),
});

const getSchema = z.object({
  validationId: z.coerce.number().int().positive(),
  type: z.enum(["interior", "cover"]).default("interior"),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdminClerkUserId(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    let result;
    if (parsed.data.type === "cover") {
      result = await validateCover(
        parsed.data.sourceUrl,
        parsed.data.podPackageId ?? LULU_POD_PACKAGE_ID,
        INTERIOR_PAGE_COUNT
      );
    } else {
      result = await validateInterior(
        parsed.data.sourceUrl,
        parsed.data.podPackageId
      );
    }
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Validation request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdminClerkUserId(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = getSchema.safeParse({
    validationId: searchParams.get("validationId"),
    type: searchParams.get("type") ?? "interior",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid validationId" },
      { status: 400 }
    );
  }

  try {
    const result =
      parsed.data.type === "cover"
        ? await getCoverValidationStatus(parsed.data.validationId)
        : await getValidationStatus(parsed.data.validationId);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Validation check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
