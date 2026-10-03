import "server-only";
import { prisma } from "@/lib/prisma";
import { PlatformSyncError } from "@/lib/social-sync/errors";
import { fetchJson, optionalString, requireRecord, finiteNumber } from "@/lib/social-sync/http";
import type { SocialProvider } from "@/lib/social-sync/types";

interface RefreshedToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

async function refreshGoogleToken(refreshToken: string): Promise<RefreshedToken> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new PlatformSyncError("PROVIDER_ERROR", "Google token refresh is not configured.");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const response = requireRecord(await fetchJson<unknown>("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  }));
  const accessToken = optionalString(response.access_token);
  if (!accessToken) throw new PlatformSyncError("TOKEN_REVOKED", "Reconnect your Google account to continue.");
  const expiresIn = finiteNumber(response.expires_in);
  return {
    accessToken,
    expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : undefined,
  };
}

async function refreshFacebookToken(accessToken: string): Promise<RefreshedToken> {
  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new PlatformSyncError("PROVIDER_ERROR", "Meta token refresh is not configured.");
  }

  const url = new URL(`https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION ?? "v25.0"}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("client_secret", clientSecret);
  url.searchParams.set("fb_exchange_token", accessToken);
  const response = requireRecord(await fetchJson<unknown>(url.toString()));
  const refreshedAccessToken = optionalString(response.access_token);
  if (!refreshedAccessToken) {
    throw new PlatformSyncError("TOKEN_REVOKED", "Reconnect your Meta account to continue.");
  }
  const expiresIn = finiteNumber(response.expires_in);
  return {
    accessToken: refreshedAccessToken,
    expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : undefined,
  };
}

async function refreshTikTokToken(refreshToken: string): Promise<RefreshedToken> {
  const clientKey = process.env.TIKTOK_CLIENT_ID;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) {
    throw new PlatformSyncError("PROVIDER_ERROR", "TikTok token refresh is not configured.");
  }

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const response = requireRecord(await fetchJson<unknown>("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  }));
  const accessToken = optionalString(response.access_token);
  if (!accessToken) throw new PlatformSyncError("TOKEN_REVOKED", "Reconnect your TikTok account to continue.");
  const expiresIn = finiteNumber(response.expires_in);
  return {
    accessToken,
    refreshToken: optionalString(response.refresh_token) ?? undefined,
    expiresAt: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : undefined,
  };
}

export async function getProviderAccessToken(userId: string, provider: SocialProvider): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider },
    select: { id: true, access_token: true, refresh_token: true, expires_at: true },
  });
  if (!account) {
    throw new PlatformSyncError("NOT_CONNECTED", `Connect ${providerLabel(provider)} before syncing.`);
  }

  const expiresSoon = account.expires_at !== null && account.expires_at <= Math.floor(Date.now() / 1000) + 60;
  if (!expiresSoon && account.access_token) return account.access_token;

  if (!account.refresh_token) {
    throw new PlatformSyncError("TOKEN_EXPIRED", `Reconnect ${providerLabel(provider)} to continue syncing.`);
  }

  let refreshed: RefreshedToken;
  switch (provider) {
    case "google":
      refreshed = await refreshGoogleToken(account.refresh_token);
      break;
    case "facebook":
      if (!account.access_token) {
        throw new PlatformSyncError("TOKEN_EXPIRED", "Reconnect Meta to continue syncing.");
      }
      refreshed = await refreshFacebookToken(account.access_token);
      break;
    case "tiktok":
      refreshed = await refreshTikTokToken(account.refresh_token);
      break;
  }

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: refreshed.accessToken,
      ...(refreshed.refreshToken ? { refresh_token: refreshed.refreshToken } : {}),
      ...(refreshed.expiresAt ? { expires_at: refreshed.expiresAt } : {}),
    },
  });

  return refreshed.accessToken;
}

function providerLabel(provider: SocialProvider) {
  if (provider === "google") return "YouTube";
  if (provider === "facebook") return "Meta / Instagram";
  return "TikTok";
}