import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }

  if (!isRecord(payload)) {
    return NextResponse.json({ error: "A signup object is required." }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const role = payload.role;

  if (
    !name || name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
    Buffer.byteLength(password, "utf8") < 12 || Buffer.byteLength(password, "utf8") > 72 ||
    (role !== UserRole.CREATOR && role !== UserRole.BRAND)
  ) {
    return NextResponse.json(
      { error: "Provide a valid name, email, password (12-72 UTF-8 bytes), and public account role." },
      { status: 400 },
    );
  }

  const userData: Prisma.UserCreateInput = {
    name,
    email,
    role,
  };

  if (role === UserRole.CREATOR) {
    const handle = typeof payload.handle === "string"
      ? payload.handle.trim().replace(/^@+/, "")
      : "";
    const category = typeof payload.category === "string" ? payload.category.trim() : "";
    const followers = payload.followers;

    if (
      !/^[A-Za-z0-9._-]{1,30}$/.test(handle) ||
      !category || category.length > 60 ||
      typeof followers !== "number" || !Number.isSafeInteger(followers) || followers < 0
    ) {
      return NextResponse.json({ error: "Creator profile data is invalid." }, { status: 400 });
    }

    userData.creatorProfile = {
      create: { handle: `@${handle}`, category, followers },
    };
  } else {
    const companyName = typeof payload.companyName === "string" ? payload.companyName.trim() : "";
    const budget = payload.budget;

    if (
      !companyName || companyName.length > 120 ||
      typeof budget !== "number" || !Number.isFinite(budget) || budget < 0 ||
      budget > 9_999_999_999.99 || Math.round(budget * 100) !== budget * 100
    ) {
      return NextResponse.json({ error: "Brand profile data is invalid." }, { status: 400 });
    }

    userData.brandProfile = {
      create: { companyName, budget: new Prisma.Decimal(budget) },
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    userData.passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: userData,
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: "An account with this email or profile handle already exists." }, { status: 409 });
    }

    console.error("Failed to create signup account:", error);
    return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}