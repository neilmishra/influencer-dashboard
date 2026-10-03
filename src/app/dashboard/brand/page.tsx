import { BrandApplicationDashboard } from "@/components/dashboard/BrandApplicationDashboard";
import { prisma } from "@/lib/prisma";
import { requireDashboardRole } from "@/lib/require-dashboard-role";

const providerPlatform = {
  google: "YouTube",
  facebook: "Instagram",
  tiktok: "TikTok",
} as const;

type PlatformName = (typeof providerPlatform)[keyof typeof providerPlatform];

function applicationStatus(status: string): "PENDING" | "ACCEPTED" | "DECLINED" {
  if (status === "ACCEPTED" || status === "DECLINED") return status;
  return "PENDING";
}

export default async function BrandDashboardPage() {
  const session = await requireDashboardRole("BRAND");

  const campaigns = await prisma.campaign.findMany({
    where: session.user.role === "ADMIN" ? {} : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      niche: true,
      platforms: true,
      budgetRange: true,
      createdAt: true,
      applications: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              creatorProfile: {
                select: {
                  handle: true,
                  category: true,
                  publicContactEmail: true,
                  followers: true,
                  youtubeFollowers: true,
                  youtubeAverageViews: true,
                  instagramFollowers: true,
                  instagramAverageEngagementRate: true,
                  tiktokFollowers: true,
                  tiktokAverageLikes: true,
                },
              },
              accounts: {
                where: { provider: { in: ["google", "facebook", "tiktok"] } },
                select: { provider: true, access_token: true, refresh_token: true },
              },
            },
          },
        },
      },
    },
  });

  const dashboardCampaigns = campaigns.map((campaign) => ({
    ...campaign,
    createdAt: campaign.createdAt.toISOString(),
    applications: campaign.applications.map((application) => {
      const profile = application.user.creatorProfile;
      const verifiedPlatforms = application.user.accounts
        .filter((account) => account.access_token || account.refresh_token)
        .flatMap((account): PlatformName[] => {
          const platform = providerPlatform[account.provider as keyof typeof providerPlatform];
          return platform ? [platform] : [];
        });

      return {
        id: application.id,
        status: applicationStatus(application.status),
        createdAt: application.createdAt.toISOString(),
        creator: {
          name: application.user.name?.trim() || profile?.handle || "Creator",
          handle: profile?.handle ?? "",
          publicContactEmail: profile?.publicContactEmail ?? null,
          followers: profile?.followers ?? 0,
          category: profile?.category ?? "Creator",
          youtubeFollowers: profile?.youtubeFollowers ?? null,
          youtubeAverageViews: profile?.youtubeAverageViews ?? null,
          instagramFollowers: profile?.instagramFollowers ?? null,
          instagramAverageEngagementRate: profile?.instagramAverageEngagementRate ?? null,
          tiktokFollowers: profile?.tiktokFollowers ?? null,
          tiktokAverageLikes: profile?.tiktokAverageLikes ?? null,
          verifiedPlatforms,
        },
      };
    }),
  }));

  return <BrandApplicationDashboard campaigns={dashboardCampaigns} />;
}