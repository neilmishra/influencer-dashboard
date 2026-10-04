import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Generates a cryptographically random 6-digit numeric string. */
function generateOtp(): string {
  // crypto.getRandomValues works in the Node.js runtime (Web Crypto API).
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Modulo 1_000_000 gives [0, 999999]; pad to always be 6 digits.
  return String(array[0]! % 1_000_000).padStart(6, "0");
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json(
      { error: "Sign in to request a password reset." },
      { status: 401 },
    );
  }

  // Only users with a password hash (credential-based accounts) should be
  // able to use this flow. OAuth-only users have no password to change.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return NextResponse.json(
      { error: "Your account uses social sign-in and does not have a password." },
      { status: 400 },
    );
  }

  const email = session.user.email;
  const code = generateOtp();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  try {
    // VerificationToken uses @@unique([identifier, token]).
    // We delete any existing code for this email first, then insert the new one.
    // This prevents accumulation and enforces a single active code per user.
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: code, expires },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not generate a verification code. Try again." },
      { status: 500 },
    );
  }

  // ── Delivery ────────────────────────────────────────────────────────────────
  // TODO: swap console.log for your transactional email provider (Resend,
  //       SendGrid, Nodemailer, etc.) when one is configured.
  console.log(
    `[password-reset] OTP for ${email}: ${code}  (expires ${expires.toISOString()})`,
  );

  return NextResponse.json({ ok: true });
}
