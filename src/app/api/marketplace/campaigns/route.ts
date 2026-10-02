import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedPlatforms = new Set(["YouTube", "Instagram", "TikTok"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to post a campaign." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }
  if (!isRecord(payload)) {
    return NextResponse.json({ error: "Campaign details are invalid." }, { status: 400 });
  }

  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const niche = typeof payload.niche === "string" ? payload.niche.trim() : "";
  const location = typeof payload.location === "string" ? payload.location.trim() : "";
  const budgetRange = typeof payload.budgetRange === "string" ? payload.budgetRange.trim() : "";
  const minFollowers = payload.minFollowers;
  const platforms = payload.platforms;

  if (
    title.length < 3 || title.length > 100 ||
    description.length < 10 || description.length > 280 ||
    niche.length === 0 || niche.length > 80 ||
    location.length < 2 || location.length > 100 ||
    budgetRange.length < 2 || budgetRange.length > 60 ||
    typeof minFollowers !== "number" || !Number.isSafeInteger(minFollowers) || minFollowers < 0 || minFollowers > 2_147_483_647 ||
    !Array.isArray(platforms) || platforms.length < 1 || platforms.length > 3 ||
    !platforms.every((platform) => typeof platform === "string" && allowedPlatforms.has(platform)) ||
    new Set(platforms).size !== platforms.length
  ) {
    return NextResponse.json({ error: "Check each campaign field and try again." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, brandProfile: { select: { companyName: true } } },
  });
  if (!user) return NextResponse.json({ error: "Your account could not be found." }, { status: 401 });

  const companyName =
    user.brandProfile?.companyName.trim() || user.name?.trim() || user.email?.split("@")[0] || "Independent brand";

  const campaign = await prisma.campaign.create({
    data: {
      companyName,
      title,
      description,
      niche,
      platforms,
      minFollowers,
      budgetRange,
      location,
      userId: session.user.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: campaign.id }, { status: 201 });
}