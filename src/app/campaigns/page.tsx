import { auth } from "@/auth";
import { MarketplaceBoard } from "@/components/campaigns/MarketplaceBoard";
import { prisma } from "@/lib/prisma";

export default async function CampaignsPage() {
  const [campaigns, session] = await Promise.all([
    prisma.campaign.findMany({
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
        budget: true,
        deadline: true,
        location: true,
        isPremium: true,
        createdAt: true,
      },
    }),
    auth(),
  ]);
  const marketplaceCampaigns = campaigns.map((campaign) => ({
    ...campaign,
    budgetRange: campaign.budget.toNumber() > 0
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(campaign.budget.toNumber())
      : campaign.budgetRange,
    deadline: campaign.deadline?.toISOString() ?? null,
  }));
  const applicationUserId = session?.user?.role === "CREATOR" ? session.user.id : null;
  const applications = applicationUserId
    ? await prisma.campaignApplication.findMany({
        where: {
          userId: applicationUserId,
          campaignId: { in: marketplaceCampaigns.map((campaign) => campaign.id) },
        },
        select: { campaignId: true },
      })
    : [];

  return (
    <MarketplaceBoard
      campaigns={marketplaceCampaigns}
      canPost={session?.user?.role === "BRAND" || session?.user?.role === "ADMIN"}
      isAuthenticated={Boolean(session?.user?.id)}
      canApply={applicationUserId !== null}
      initiallyAppliedCampaignIds={applications.map((application) => application.campaignId)}
    />
  );
}