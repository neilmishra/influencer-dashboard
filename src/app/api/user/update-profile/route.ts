import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to update your profile." },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!isRecord(payload)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // ── name (only updatable field) ─────────────────────────────────────────────
  // Email cannot be changed through this endpoint; it is managed separately
  // via the password-reset / account verification flow.
  const { name } = payload;

  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.trim().length > 120
  ) {
    return NextResponse.json(
      { error: "Name must be between 1 and 120 characters." },
      { status: 400 },
    );
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not update your profile. Please try again." },
      { status: 500 },
    );
  }
}
