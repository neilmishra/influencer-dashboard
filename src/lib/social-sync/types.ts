export type SocialProvider = "google" | "facebook" | "tiktok";

export type SocialPlatform = "YouTube" | "Instagram" | "TikTok";

export interface SyncedPost {
  platform: SocialPlatform;
  externalId: string;
  title: string;
  url: string | null;
  publishedAt: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

export interface PlatformSyncData {
  provider: SocialProvider;
  platform: SocialPlatform;
  followers: number | null;
  engagementRate: number | null;
  totalViews: number | null;
  averageViews: number | null;
  averageLikes: number | null;
  bio: string | null;
  recentPosts: SyncedPost[];
}

export interface PlatformSyncWarning {
  provider: SocialProvider;
  platform: SocialPlatform;
  code: string;
  message: string;
}