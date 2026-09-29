import { NextResponse } from "next/server";
import { appendCreator, isNewCreator, readDatabase } from "@/lib/jsonDatabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const database = await readDatabase();
    return NextResponse.json(database.creators, { status: 200 });
  } catch (error) {
    console.error("Failed to read creators from the local database:", error);
    return NextResponse.json({ error: "Unable to load creators." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }

  if (!isNewCreator(payload)) {
    return NextResponse.json({ error: "Creator data is missing required fields or is invalid." }, { status: 400 });
  }

  try {
    const creator = await appendCreator(payload);
    return NextResponse.json(creator, { status: 201 });
  } catch (error) {
    console.error("Failed to save creator to the local database:", error);
    return NextResponse.json({ error: "Unable to save creator." }, { status: 500 });
  }
}