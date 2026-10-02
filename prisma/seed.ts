import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running the Prisma seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const creators = [
  {
    name: "Maya Chen",
    email: "maya.chen@creators.test",
    handle: "@mayamakes",
    category: "Beauty",
    followers: 428_000,
    engagementRate: 4.8,
  },
  {
    name: "Jordan Ellis",
    email: "jordan.ellis@creators.test",
    handle: "@jordaneats",
    category: "Food",
    followers: 186_000,
    engagementRate: 6.2,
  },
  {
    name: "Sofia Ramirez",
    email: "sofia.ramirez@creators.test",
    handle: "@sofiastyles",
    category: "Fashion",
    followers: 735_000,
    engagementRate: 3.9,
  },
];

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    throw new Error("Set SEED_ADMIN_PASSWORD to a password of at least 12 characters before seeding.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: "admin@dashboard.com" },
    create: {
      email: "admin@dashboard.com",
      name: "Dashboard Admin",
      passwordHash,
      role: "ADMIN",
    },
    update: {
      name: "Dashboard Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  for (const creator of creators) {
    const profile = {
      handle: creator.handle,
      category: creator.category,
      followers: creator.followers,
      engagementRate: creator.engagementRate,
    };

    await prisma.user.upsert({
      where: { email: creator.email },
      create: {
        email: creator.email,
        name: creator.name,
        role: "CREATOR",
        creatorProfile: { create: profile },
      },
      update: {
        name: creator.name,
        creatorProfile: {
          upsert: {
            create: profile,
            update: profile,
          },
        },
      },
    });
  }

  console.log("Seeded the admin and 3 creator profiles.");
}

main()
  .catch((error: unknown) => {
    console.error("Prisma seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });