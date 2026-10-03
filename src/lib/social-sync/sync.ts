import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PlatformSyncError, safeSyncMessage } from "@/lib/social-sync/errors";
import { syncInstagram } from "@/lib/social-sync/instagram";
import { syncTikTok } from "@/lib/social-sync/tiktok";
import { syncYouTube } from "@/lib/social-sync/youtube";
import { getProviderAccessToken } from "@/lib/social-sync/tokens";
import type {
  PlatformSyncData,
  PlatformSyncWarning,
  SocialPlatform,
  SocialProvider,
  SyncedPost,
} from "@/lib/social-sync/types";

export type PlatformSyncOutcome =
  | { status: "synced"; platform: SocialPlatform; posts: number }
  | ({ status: "warning"; platform: SocialPlatform } & PlatformSyncWarning);

const platforms: { provider: SocialProvider; platform: SocialPlatform }[] = [
  { provider: "google", platform: "YouTube" },
  { provider: "facebook", platform: "Instagram" },
  { provider: "tiktok", platform: "TikTok" },
];

type PlatformSyncAttempt =
  | { provider: SocialProvider; platform: SocialPlatform; data: PlatformSyncData }
  | { provider: SocialProvider; platform: SocialPlatform; error: { code: string; message: string } };

async function fetchPlatformData(userId: string, provider: SocialProvider): Promise<PlatformSyncData> {
  const token = await getProviderAccessToken(userId, provider);
  if (provider === "google") return syncYouTube(token);
  if (provider === "facebook") return syncInstagram(token);
  return syncTikTok(token);
}

function isSyncedPost(value: unknown): value is SyncedPost {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const post = value as Record<string, unknown>;
  return (
    (post.platform === "YouTube" || post.platform === "Instagram" || post.platform === "TikTok") &&
    typeof post.externalId === "string" &&
    typeof post.title === "string"
  );
}

function previousPosts(value: Prisma.JsonValue | null): SyncedPost[] {
  if (!value || !Array.isArray(value)) return [];
  const posts: SyncedPost[] = [];
  for (const entry of value) {
    if (!isSyncedPost(entry)) continue;
    posts.push({
      platform: entry.platform,
      externalId: entry.externalId,
      title: entry.title,
      url: typeof entry.url === "string" ? entry.url : null,
      publishedAt: typeof entry.publishedAt === "string" ? entry.publishedAt : null,
      views: typeof entry.views === "number" ? entry.views : null,
      likes: typeof entry.likes === "number" ? entry.likes : null,
      comments: typeof entry.comments === "number" ? entry.comments : null,
      shares: typeof entry.shares === "number" ? entry.shares : null,
    });
  }
  return posts;
}

export async function syncCreatorPlatforms(userId: string): Promise<PlatformSyncOutcome[]> {
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      youtubeFollowers: true,
      youtubeTotalViews: true,
      youtubeAverageViews: true,
      instagramFollowers: true,
      instagramAverageEngagementRate: true,
      instagramBio: true,
      tiktokFollowers: true,
      tiktokAverageLikes: true,
      recentPosts: true,
    },
  });
  if (!profile) throw new PlatformSyncError("PROVIDER_ERROR", "A creator profile is required before syncing.");

  const results: PlatformSyncAttempt[] = await Promise.all(platforms.map(async ({ provider, platform }) => {
    try {
      const data = await fetchPlatformData(userId, provider);
      return { provider, platform, data } as const;
    } catch (error) {
      const safeError = safeSyncMessage(error);
      return { provider, platform, error: safeError } as const;
    }
  }));

  const successes = results.filter(
    (result): result is Extract<PlatformSyncAttempt, { data: PlatformSyncData }> => "data" in result,
  );
  if (successes.length > 0) {
    const update: Prisma.CreatorProfileUpdateInput = {
      metricsSyncedAt: new Date(),
    };
    const successfulPlatforms = new Set(successes.map(({ platform }) => platform));

    for (const { data } of successes) {
      if (data.provider === "google") {
        if (data.followers !== null) update.youtubeFollowers = data.followers;
        if (data.totalViews !== null) update.youtubeTotalViews = data.totalViews;
        if (data.averageViews !== null) update.youtubeAverageViews = data.averageViews;
      } else if (data.provider === "facebook") {
        if (data.followers !== null) update.instagramFollowers = data.followers;
        if (data.engagementRate !== null) update.instagramAverageEngagementRate = data.engagementRate;
        if (data.bio !== null) update.instagramBio = data.bio;
      } else {
        if (data.followers !== null) update.tiktokFollowers = data.followers;
        if (data.averageLikes !== null) update.tiktokAverageLikes = data.averageLikes;
      }
    }

    const retainedPosts = previousPosts(profile.recentPosts)
      .filter((post) => !successfulPlatforms.has(post.platform));
    const newPosts = successes.flatMap(({ data }) => data.recentPosts);
    const mergedPosts = [...retainedPosts, ...newPosts]
      .sort((first, second) => (second.publishedAt ?? "").localeCompare(first.publishedAt ?? ""))
      .slice(0, 60);
    update.recentPosts = mergedPosts as unknown as Prisma.InputJsonValue;

    await prisma.creatorProfile.update({ where: { id: profile.id }, data: update });
  }

  return results.map((result) => {
    if ("data" in result) {
      return { status: "synced", platform: result.platform, posts: result.data.recentPosts.length };
    }
    return {
      status: "warning",
      platform: result.platform,
      provider: result.provider,
      ...result.error,
    };
  });
}