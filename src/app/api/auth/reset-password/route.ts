import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json(
      { error: "Sign in to change your password." },
      { status: 401 },
    );
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
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

  const { code, newPassword } = payload;

  // ── Validate code ───────────────────────────────────────────────────────────
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Verification code must be a 6-digit number." },
      { status: 400 },
    );
  }

  // ── Validate new password ───────────────────────────────────────────────────
  if (
    typeof newPassword !== "string" ||
    newPassword.length < MIN_PASSWORD_LENGTH ||
    newPassword.length > MAX_PASSWORD_LENGTH
  ) {
    return NextResponse.json(
      {
        error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
      },
      { status: 400 },
    );
  }

  const email = session.user.email;

  // ── Look up the stored OTP ──────────────────────────────────────────────────
  // VerificationToken is keyed on [identifier, token] — identifier = email,
  // token = the 6-digit code stored by /api/auth/reset-password-request.
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: code } },
  });

  if (!record) {
    return NextResponse.json(
      { error: "Incorrect verification code. Please try again." },
      { status: 400 },
    );
  }

  if (record.expires < new Date()) {
    // Clean up the stale record while we're here.
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    return NextResponse.json(
      { error: "Verification code has expired. Request a new one." },
      { status: 400 },
    );
  }

  // ── Update password + invalidate code (single transaction) ─────────────────
  const passwordHash = await bcrypt.hash(newPassword, 12);

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash },
      }),
      // Consume the code so it cannot be replayed.
      prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    ]);
  } catch {
    return NextResponse.json(
      { error: "Could not update your password. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
