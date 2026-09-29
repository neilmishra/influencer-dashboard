import { NextResponse } from "next/server";
import { appendCampaign, isNewCampaign, readDatabase } from "@/lib/jsonDatabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const database = await readDatabase();
    return NextResponse.json(database.campaigns, { status: 200 });
  } catch (error) {
    console.error("Failed to read campaigns from the local database:", error);
    return NextResponse.json({ error: "Unable to load campaigns." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }

  if (!isNewCampaign(payload)) {
    return NextResponse.json({ error: "Campaign data is missing required fields or is invalid." }, { status: 400 });
  }

  try {
    const campaign = await appendCampaign(payload);
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Failed to save campaign to the local database:", error);
    return NextResponse.json({ error: "Unable to save campaign." }, { status: 500 });
  }
}