"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import type { CreateCampaignState } from "@/components/campaigns/campaignTypes";
import { prisma } from "@/lib/prisma";
import { requireDashboardRole } from "@/lib/require-dashboard-role";

const platforms = ["Instagram", "YouTube", "TikTok"] as const;

export async function createCampaignAction(
  _previousState: CreateCampaignState,
  formData: FormData,
): Promise<CreateCampaignState> {
  const session = await requireDashboardRole("BRAND");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rawBudget = String(formData.get("budget") ?? "").trim();
  const platform = String(formData.get("platform") ?? "");
  const deadlineValue = String(formData.get("deadline") ?? "");

  if (title.length < 3 || title.length > 100) {
    return { error: "Enter a campaign title between 3 and 100 characters." };
  }
  if (description.length < 10 || description.length > 280) {
    return { error: "Enter a description between 10 and 280 characters." };
  }
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(rawBudget)) {
    return { error: "Enter a valid budget with up to two decimal places." };
  }
  const budget = Number(rawBudget);
  if (!Number.isFinite(budget) || budget <= 0 || budget > 9_999_999_999.99) {
    return { error: "Budget must be greater than zero and within the supported range." };
  }
  if (!platforms.includes(platform as (typeof platforms)[number])) {
    return { error: "Choose Instagram, YouTube, or TikTok." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadlineValue)) {
    return { error: "Choose a valid campaign deadline." };
  }
  const deadlineDate = new Date(`${deadlineValue}T00:00:00.000Z`);
  if (
    Number.isNaN(deadlineDate.getTime()) ||
    deadlineDate.toISOString().slice(0, 10) !== deadlineValue ||
    deadlineValue < new Date().toISOString().slice(0, 10)
  ) {
    return { error: "Deadline must be today or a future date." };
  }
  deadlineDate.setUTCHours(23, 59, 59, 999);

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        brandProfile: { select: { companyName: true } },
      },
    });
    if (!user) return { error: "Your account could not be found." };

    const companyName =
      user.brandProfile?.companyName.trim() || user.name?.trim() || user.email?.split("@")[0] || "Brand";
    const budgetLabel = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(budget);

    await prisma.campaign.create({
      data: {
        companyName,
        title,
        description,
        niche: "General",
        platforms: [platform],
        minFollowers: 0,
        budgetRange: budgetLabel,
        budget: new Prisma.Decimal(rawBudget),
        deadline: deadlineDate,
        location: "Remote",
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return { error: "Could not save the campaign. Please try again." };
  }

  revalidatePath("/dashboard/brand");
  revalidatePath("/campaigns");
  revalidatePath("/dashboard/creator/marketplace");
  redirect("/dashboard/brand");
}