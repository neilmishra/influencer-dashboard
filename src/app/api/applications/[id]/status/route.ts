import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface StatusRouteContext {
  params: Promise<{ id: string }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function PATCH(request: Request, { params }: StatusRouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to manage applications." }, { status: 401 });
  }
  if (session.user.role !== "BRAND") {
    return NextResponse.json({ error: "Brand access is required." }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }
  if (!isRecord(payload) || (payload.status !== "ACCEPTED" && payload.status !== "DECLINED")) {
    return NextResponse.json({ error: "Choose an accepted or declined status." }, { status: 400 });
  }

  const { id } = await params;
  const application = await prisma.campaignApplication.findUnique({
    where: { id },
    select: { id: true, status: true, campaign: { select: { userId: true } } },
  });
  if (!application || application.campaign.userId !== session.user.id) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const status = payload.status;
  if (application.status === status) {
    return NextResponse.json({ id: application.id, status }, { status: 200 });
  }
  if (application.status !== "PENDING") {
    return NextResponse.json({ error: "This application has already been reviewed." }, { status: 409 });
  }

  try {
    const update = await prisma.campaignApplication.updateMany({
      where: { id, status: "PENDING" },
      data: { status },
    });
    if (update.count === 0) {
      const latest = await prisma.campaignApplication.findUnique({
        where: { id },
        select: { status: true },
      });
      if (latest?.status !== status) {
        return NextResponse.json({ error: "This application has already been reviewed." }, { status: 409 });
      }
    }

    return NextResponse.json({ id, status }, { status: 200 });
  } catch (error) {
    console.error("Failed to update campaign application status:", error);
    return NextResponse.json({ error: "Unable to update this application." }, { status: 500 });
  }
}