import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }

  if (!isRecord(payload) || typeof payload.email !== "string") {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = payload.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscription.upsert({
      where: { email },
      update: {},
      create: { email },
      select: { id: true },
    });

    return NextResponse.json({ subscribed: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to save newsletter subscription:", error);
    return NextResponse.json({ error: "Unable to save your subscription right now." }, { status: 500 });
  }
}