import { MarketplaceBoard } from "@/components/campaigns/MarketplaceBoard";
import { prisma } from "@/lib/prisma";
import { requireDashboardRole } from "@/lib/require-dashboard-role";

export default async function CreatorMarketplacePage() {
  const session = await requireDashboardRole("CREATOR");
  const campaigns = await prisma.campaign.findMany({
    where: {
      OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
    },
    orderBy: [{ isPremium: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      companyName: true,
      title: true,
      description: true,
      niche: true,
      platforms: true,
      minFollowers: true,
      budgetRange: true,
      totalBudget: true,
      deadline: true,
      location: true,
      isPremium: true,
      createdAt: true,
    },
  });

  const applications = campaigns.length
    ? await prisma.campaignApplication.findMany({
        where: {
          userId: session.user.id,
          campaignId: { in: campaigns.map((campaign) => campaign.id) },
        },
        select: { campaignId: true },
      })
    : [];

  const marketplaceCampaigns = campaigns.map((campaign) => ({
    ...campaign,
    budgetRange: campaign.totalBudget.toNumber() > 0
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(campaign.totalBudget.toNumber())
      : campaign.budgetRange,
    deadline: campaign.deadline?.toISOString() ?? null,
  }));

  return (
    <MarketplaceBoard
      campaigns={marketplaceCampaigns}
      canPost={false}
      isAuthenticated
      canApply
      initiallyAppliedCampaignIds={applications.map((application) => application.campaignId)}
      detailsBasePath="/dashboard/creator/marketplace"
    />
  );
}