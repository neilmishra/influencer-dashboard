import { randomUUID } from "node:crypto";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Campaign, Creator, Database, NewCampaign, NewCreator } from "@/types";

const databasePath = join(process.cwd(), "src", "data", "db.json");
type DatabaseGlobal = typeof globalThis & { __influencerDatabaseWriteQueue?: Promise<void> };
const databaseGlobal = globalThis as DatabaseGlobal;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function isCreator(value: unknown): value is Creator {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.handle) &&
    isNonEmptyString(value.avatar) &&
    typeof value.followers === "number" &&
    Number.isFinite(value.followers) &&
    value.followers >= 0 &&
    typeof value.engagementRate === "number" &&
    Number.isFinite(value.engagementRate) &&
    value.engagementRate >= 0 &&
    isNonEmptyString(value.category)
  );
}

function isCampaign(value: unknown): value is Campaign {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.brand) &&
    (value.status === "active" || value.status === "completed" || value.status === "planned") &&
    isNonEmptyString(value.startDate) &&
    isNonEmptyString(value.endDate) &&
    typeof value.budget === "number" &&
    Number.isFinite(value.budget) &&
    value.budget >= 0 &&
    typeof value.spent === "number" &&
    Number.isFinite(value.spent) &&
    value.spent >= 0 &&
    Array.isArray(value.creatorIds) &&
    value.creatorIds.every(isNonEmptyString)
  );
}

function isDatabase(value: unknown): value is Database {
  return (
    isRecord(value) &&
    Array.isArray(value.creators) &&
    value.creators.every(isCreator) &&
    Array.isArray(value.campaigns) &&
    value.campaigns.every(isCampaign)
  );
}

export function isNewCreator(value: unknown): value is NewCreator {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["name", "handle", "avatar", "followers", "engagementRate", "category"]) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.handle) &&
    isNonEmptyString(value.avatar) &&
    typeof value.followers === "number" &&
    Number.isFinite(value.followers) &&
    value.followers >= 0 &&
    typeof value.engagementRate === "number" &&
    Number.isFinite(value.engagementRate) &&
    value.engagementRate >= 0 &&
    isNonEmptyString(value.category)
  );
}

export function isNewCampaign(value: unknown): value is NewCampaign {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, ["name", "brand", "status", "startDate", "endDate", "budget", "spent", "creatorIds"]) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.brand) &&
    (value.status === "active" || value.status === "completed" || value.status === "planned") &&
    isNonEmptyString(value.startDate) &&
    isNonEmptyString(value.endDate) &&
    typeof value.budget === "number" &&
    Number.isFinite(value.budget) &&
    value.budget >= 0 &&
    typeof value.spent === "number" &&
    Number.isFinite(value.spent) &&
    value.spent >= 0 &&
    Array.isArray(value.creatorIds) &&
    value.creatorIds.every(isNonEmptyString)
  );
}

export async function readDatabase(): Promise<Database> {
  const contents = await readFile(databasePath, "utf8");
  const parsed: unknown = JSON.parse(contents);

  if (!isDatabase(parsed)) {
    throw new Error("The local database has an invalid structure.");
  }

  return parsed;
}

async function writeDatabase(database: Database): Promise<void> {
  const temporaryPath = `${databasePath}.${randomUUID()}.tmp`;

  try {
    await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryPath, databasePath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

async function appendRecord<T extends NewCreator | NewCampaign>(
  collection: "creators" | "campaigns",
  value: T,
): Promise<T & { id: string }> {
  const previousWrite = databaseGlobal.__influencerDatabaseWriteQueue ?? Promise.resolve();
  const operation = previousWrite.then(async () => {
    const database = await readDatabase();
    const record = { ...value, id: randomUUID() } as T & { id: string };

    if (collection === "creators") {
      database.creators.push(record as Creator);
    } else {
      database.campaigns.push(record as Campaign);
    }

    await writeDatabase(database);
    return record;
  });

  databaseGlobal.__influencerDatabaseWriteQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export function appendCreator(creator: NewCreator): Promise<Creator> {
  return appendRecord("creators", creator);
}

export function appendCampaign(campaign: NewCampaign): Promise<Campaign> {
  return appendRecord("campaigns", campaign);
}