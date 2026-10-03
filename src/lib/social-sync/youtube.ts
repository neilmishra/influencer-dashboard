import "server-only";
import { PlatformSyncError } from "@/lib/social-sync/errors";
import { fetchJson, finiteNumber, optionalString, requireRecord } from "@/lib/social-sync/http";
import type { PlatformSyncData, SyncedPost } from "@/lib/social-sync/types";

interface YouTubeListResponse {
  items?: unknown[];
}

function dateString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function syncYouTube(accessToken: string): Promise<PlatformSyncData> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelUrl.searchParams.set("part", "statistics,contentDetails");
  channelUrl.searchParams.set("mine", "true");
  const channelResponse = await fetchJson<YouTubeListResponse>(channelUrl.toString(), { headers });
  const channel = requireRecord(channelResponse.items?.[0], "No YouTube channel was found for this account.");
  const statistics = requireRecord(channel.statistics, "YouTube channel statistics were unavailable.");
  const contentDetails = requireRecord(channel.contentDetails, "YouTube upload details were unavailable.");
  const relatedPlaylists = requireRecord(contentDetails.relatedPlaylists);
  const uploadsPlaylistId = optionalString(relatedPlaylists.uploads);

  const totalViews = finiteNumber(statistics.viewCount);
  const followers = finiteNumber(statistics.subscriberCount);
  let posts: SyncedPost[] = [];

  if (uploadsPlaylistId) {
    const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    playlistUrl.searchParams.set("part", "contentDetails");
    playlistUrl.searchParams.set("playlistId", uploadsPlaylistId);
    playlistUrl.searchParams.set("maxResults", "10");
    const playlistResponse = await fetchJson<YouTubeListResponse>(playlistUrl.toString(), { headers });
    const videoIds = (playlistResponse.items ?? []).flatMap((item) => {
      const itemRecord = requireRecord(item);
      const details = requireRecord(itemRecord.contentDetails);
      const videoId = optionalString(details.videoId);
      return videoId ? [videoId] : [];
    });

    if (videoIds.length > 0) {
      const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      videosUrl.searchParams.set("part", "snippet,statistics");
      videosUrl.searchParams.set("id", videoIds.join(","));
      const videosResponse = await fetchJson<YouTubeListResponse>(videosUrl.toString(), { headers });
      posts = (videosResponse.items ?? []).flatMap((item): SyncedPost[] => {
        const video = requireRecord(item);
        const id = optionalString(video.id);
        if (!id) return [];
        const snippet = requireRecord(video.snippet);
        const videoStats = requireRecord(video.statistics);
        return [{
          platform: "YouTube",
          externalId: id,
          title: optionalString(snippet.title) ?? "YouTube video",
          url: `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
          publishedAt: dateString(snippet.publishedAt),
          views: finiteNumber(videoStats.viewCount),
          likes: finiteNumber(videoStats.likeCount),
          comments: finiteNumber(videoStats.commentCount),
          shares: null,
        }];
      });
    }
  }

  const viewsWithData = posts.reduce((sum, post) => sum + (post.views ?? 0), 0);
  const interactions = posts.reduce((sum, post) => sum + (post.likes ?? 0) + (post.comments ?? 0), 0);
  const averageViews = posts.length
    ? Math.round(posts.reduce((sum, post) => sum + (post.views ?? 0), 0) / posts.length)
    : null;

  if (totalViews === null && followers === null && posts.length === 0) {
    throw new PlatformSyncError("INVALID_RESPONSE", "YouTube returned no channel or video statistics.");
  }

  return {
    provider: "google",
    platform: "YouTube",
    followers,
    totalViews,
    averageViews,
    engagementRate: viewsWithData > 0 ? Number(((interactions / viewsWithData) * 100).toFixed(2)) : null,
    averageLikes: null,
    bio: null,
    recentPosts: posts,
  };
}