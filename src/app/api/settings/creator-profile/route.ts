import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const integerFields = [
  "youtubeFollowers",
  "youtubeAverageViews",
  "instagramFollowers",
  "tiktokFollowers",
  "tiktokAverageLikes",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalInteger(value: unknown): number | null | undefined {
  if (value === null || value === "") return null;
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > 2_147_483_647
  ) {
    return undefined;
  }
  return value;
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to update your metrics." }, { status: 401 });
  }
  if (session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Creator access is required." }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }
  if (!isRecord(payload)) {
    return NextResponse.json({ error: "Metric values are invalid." }, { status: 400 });
  }

  const category = payload.category;
  if (
    typeof category !== "string" ||
    category.trim().length === 0 ||
    category.trim().length > 80
  ) {
    return NextResponse.json({ error: "Choose a creator category of 80 characters or fewer." }, { status: 400 });
  }

  const bioSummary = payload.bioSummary;
  if (typeof bioSummary !== "string" || bioSummary.length > 2_000) {
    return NextResponse.json({ error: "Bio summary must be 2,000 characters or fewer." }, { status: 400 });
  }

  const publicContactEmail = payload.publicContactEmail;
  if (
    typeof publicContactEmail !== "string" ||
    publicContactEmail.length > 254 ||
    (publicContactEmail !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicContactEmail))
  ) {
    return NextResponse.json({ error: "Enter a valid public contact email or leave it blank." }, { status: 400 });
  }

  const integers: Record<(typeof integerFields)[number], number | null> = {
    youtubeFollowers: null,
    youtubeAverageViews: null,
    instagramFollowers: null,
    tiktokFollowers: null,
    tiktokAverageLikes: null,
  };
  for (const field of integerFields) {
    const value = optionalInteger(payload[field]);
    if (value === undefined) {
      return NextResponse.json({ error: "Counts must be non-negative whole numbers." }, { status: 400 });
    }
    integers[field] = value;
  }

  const engagementValue = payload.instagramAverageEngagementRate;
  let instagramAverageEngagementRate: number | null = null;
  if (engagementValue !== null && engagementValue !== "") {
    if (
      typeof engagementValue !== "number" ||
      !Number.isFinite(engagementValue) ||
      engagementValue < 0 ||
      engagementValue > 100
    ) {
      return NextResponse.json({ error: "Engagement rate must be between 0 and 100 percent." }, { status: 400 });
    }
    instagramAverageEngagementRate = engagementValue;
  }

  try {
    await prisma.creatorProfile.update({
      where: { userId: session.user.id },
      data: {
        category: category.trim(),
        bioSummary: bioSummary.trim() || null,
        publicContactEmail: publicContactEmail.trim().toLowerCase() || null,
        ...integers,
        instagramAverageEngagementRate,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save creator metrics." }, { status: 404 });
  }
}