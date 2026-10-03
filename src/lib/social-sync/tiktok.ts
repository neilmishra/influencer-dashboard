import "server-only";
import { PlatformSyncError } from "@/lib/social-sync/errors";
import { fetchJson, finiteNumber, optionalString, requireRecord } from "@/lib/social-sync/http";
import type { PlatformSyncData, SyncedPost } from "@/lib/social-sync/types";

interface TikTokEnvelope {
  data?: unknown;
  error?: unknown;
}

function assertTikTokSuccess(response: TikTokEnvelope) {
  const error = response.error;
  if (!error) return;
  const errorRecord = requireRecord(error, "TikTok returned an invalid response.");
  const code = optionalString(errorRecord.code);
  if (!code || code === "ok") return;
  if (/rate.?limit/i.test(code)) {
    throw new PlatformSyncError("RATE_LIMITED", "TikTok is rate-limiting requests. Try again later.");
  }
  if (/scope|permission/i.test(code)) {
    throw new PlatformSyncError("PERMISSION_DENIED", "TikTok did not grant the required data permissions.");
  }
  if (/token|auth/i.test(code)) {
    throw new PlatformSyncError("TOKEN_REVOKED", "Reconnect your TikTok account to continue syncing.");
  }
  throw new PlatformSyncError("PROVIDER_ERROR", "TikTok could not complete the sync request.");
}

function dateString(value: unknown): string | null {
  const seconds = finiteNumber(value);
  if (seconds === null) return null;
  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function syncTikTok(accessToken: string): Promise<PlatformSyncData> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  const profileUrl = new URL("https://open.tiktokapis.com/v2/user/info/");
  profileUrl.searchParams.set(
    "fields",
    "open_id,display_name,username,bio_description,follower_count,following_count,likes_count,video_count",
  );
  const profileResponse = await fetchJson<TikTokEnvelope>(profileUrl.toString(), { headers });
  assertTikTokSuccess(profileResponse);
  const profileEnvelope = requireRecord(profileResponse.data);
  const profile = requireRecord(profileEnvelope.user);

  const videosUrl = new URL("https://open.tiktokapis.com/v2/video/list/");
  videosUrl.searchParams.set(
    "fields",
    "id,create_time,share_url,video_description,title,like_count,comment_count,share_count,view_count",
  );
  const videosResponse = await fetchJson<TikTokEnvelope>(videosUrl.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({ max_count: 20 }),
  });
  assertTikTokSuccess(videosResponse);
  const videoEnvelope = requireRecord(videosResponse.data);
  const videos = Array.isArray(videoEnvelope.videos) ? videoEnvelope.videos : [];
  const recentPosts: SyncedPost[] = videos.flatMap((rawVideo): SyncedPost[] => {
    const video = requireRecord(rawVideo);
    const externalId = optionalString(video.id);
    if (!externalId) return [];
    return [{
      platform: "TikTok",
      externalId,
      title: optionalString(video.title) ?? optionalString(video.video_description)?.slice(0, 160) ?? "TikTok video",
      url: optionalString(video.share_url),
      publishedAt: dateString(video.create_time),
      views: finiteNumber(video.view_count),
      likes: finiteNumber(video.like_count),
      comments: finiteNumber(video.comment_count),
      shares: finiteNumber(video.share_count),
    }];
  });

  const totalViews = recentPosts.reduce((sum, post) => sum + (post.views ?? 0), 0);
  const interactions = recentPosts.reduce(
    (sum, post) => sum + (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0),
    0,
  );
  if (finiteNumber(profile.follower_count) === null && recentPosts.length === 0) {
    throw new PlatformSyncError("INVALID_RESPONSE", "TikTok returned no profile or video metrics.");
  }

  return {
    provider: "tiktok",
    platform: "TikTok",
    followers: finiteNumber(profile.follower_count),
    engagementRate: totalViews > 0 ? Number(((interactions / totalViews) * 100).toFixed(2)) : null,
    totalViews: null,
    averageViews: recentPosts.length ? Math.round(totalViews / recentPosts.length) : null,
    averageLikes: recentPosts.length
      ? Math.round(recentPosts.reduce((sum, post) => sum + (post.likes ?? 0), 0) / recentPosts.length)
      : null,
    bio: optionalString(profile.bio_description),
    recentPosts,
  };
}