import { auth } from "@/auth";
import { MarketplaceBoard } from "@/components/campaigns/MarketplaceBoard";
import { prisma } from "@/lib/prisma";

export default async function CampaignsPage() {
  const [campaigns, session] = await Promise.all([
    prisma.campaign.findMany({
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
        location: true,
        isPremium: true,
        createdAt: true,
      },
    }),
    auth(),
  ]);
  const applicationUserId = session?.user?.role === "CREATOR" ? session.user.id : null;
  const applications = applicationUserId
    ? await prisma.campaignApplication.findMany({
        where: {
          userId: applicationUserId,
          campaignId: { in: campaigns.map((campaign) => campaign.id) },
        },
        select: { campaignId: true },
      })
    : [];

  return (
    <MarketplaceBoard
      campaigns={campaigns}
      canPost={Boolean(session?.user?.id)}
      isAuthenticated={Boolean(session?.user?.id)}
      canApply={applicationUserId !== null}
      initiallyAppliedCampaignIds={applications.map((application) => application.campaignId)}
    />
  );
}