import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface ApplyRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: ApplyRouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to apply for a campaign." }, { status: 401 });
  }
  if (session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Creator access is required to apply." }, { status: 403 });
  }

  const { id: campaignId } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true },
  });
  if (!campaign) {
    return NextResponse.json({ error: "This campaign is no longer available." }, { status: 404 });
  }

  try {
    await prisma.campaignApplication.upsert({
      where: {
        campaignId_userId: {
          campaignId,
          userId: session.user.id,
        },
      },
      update: {},
      create: {
        campaignId,
        userId: session.user.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ applied: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to submit campaign application:", error);
    return NextResponse.json({ error: "Unable to submit your application." }, { status: 500 });
  }
}