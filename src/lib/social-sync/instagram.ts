import "server-only";
import { PlatformSyncError } from "@/lib/social-sync/errors";
import { fetchJson, finiteNumber, optionalString, requireRecord } from "@/lib/social-sync/http";
import type { PlatformSyncData, SyncedPost } from "@/lib/social-sync/types";

interface MetaListResponse {
  data?: unknown[];
}

function graphUrl(path: string, fields?: string) {
  const version = process.env.META_GRAPH_API_VERSION ?? "v25.0";
  if (!/^v\d+\.\d+$/.test(version)) {
    throw new PlatformSyncError("PROVIDER_ERROR", "Meta Graph API version is not configured correctly.");
  }
  const url = new URL(`https://graph.facebook.com/${version}/${path.replace(/^\//, "")}`);
  if (fields) url.searchParams.set("fields", fields);
  return url;
}

function dateString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function syncInstagram(userAccessToken: string): Promise<PlatformSyncData> {
  const pageUrl = graphUrl("me/accounts", "id,name,access_token,instagram_business_account{id,username}");
  const pagesResponse = await fetchJson<MetaListResponse>(pageUrl.toString(), {
    headers: { Authorization: `Bearer ${userAccessToken}` },
  });

  let instagramId: string | null = null;
  let pageAccessToken: string | null = null;
  for (const rawPage of pagesResponse.data ?? []) {
    const page = requireRecord(rawPage);
    const instagramAccount = page.instagram_business_account;
    if (!instagramAccount) continue;
    const account = requireRecord(instagramAccount);
    const id = optionalString(account.id);
    const token = optionalString(page.access_token);
    if (id && token) {
      instagramId = id;
      pageAccessToken = token;
      break;
    }
  }

  if (!instagramId || !pageAccessToken) {
    throw new PlatformSyncError(
      "PERMISSION_DENIED",
      "No Instagram Business or Creator account linked to an authorized Facebook Page was found.",
    );
  }

  const headers = { Authorization: `Bearer ${pageAccessToken}` };
  const profileUrl = graphUrl(encodeURIComponent(instagramId), "id,username,biography,followers_count,media_count");
  const profile = requireRecord(await fetchJson<unknown>(profileUrl.toString(), { headers }));
  const followers = finiteNumber(profile.followers_count);

  const mediaUrl = graphUrl(`${encodeURIComponent(instagramId)}/media`);
  mediaUrl.searchParams.set("fields", "id,caption,media_type,permalink,timestamp,like_count,comments_count");
  mediaUrl.searchParams.set("limit", "12");
  const mediaResponse = await fetchJson<MetaListResponse>(mediaUrl.toString(), { headers });
  const recentPosts: SyncedPost[] = (mediaResponse.data ?? []).flatMap((rawMedia): SyncedPost[] => {
    const media = requireRecord(rawMedia);
    const externalId = optionalString(media.id);
    if (!externalId) return [];
    return [{
      platform: "Instagram",
      externalId,
      title: optionalString(media.caption)?.slice(0, 160) ?? optionalString(media.media_type) ?? "Instagram post",
      url: optionalString(media.permalink),
      publishedAt: dateString(media.timestamp),
      views: null,
      likes: finiteNumber(media.like_count),
      comments: finiteNumber(media.comments_count),
      shares: null,
    }];
  });

  const interactions = recentPosts.reduce((sum, post) => sum + (post.likes ?? 0) + (post.comments ?? 0), 0);
  const engagementRate = followers && recentPosts.length
    ? Number(((interactions / recentPosts.length / followers) * 100).toFixed(2))
    : null;
  if (followers === null && recentPosts.length === 0) {
    throw new PlatformSyncError("INVALID_RESPONSE", "Instagram returned no profile or recent media data.");
  }

  return {
    provider: "facebook",
    platform: "Instagram",
    followers,
    engagementRate,
    totalViews: null,
    averageViews: null,
    averageLikes: recentPosts.length
      ? Math.round(recentPosts.reduce((sum, post) => sum + (post.likes ?? 0), 0) / recentPosts.length)
      : null,
    bio: optionalString(profile.biography),
    recentPosts,
  };
}