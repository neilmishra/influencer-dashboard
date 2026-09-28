export type Platform = "instagram" | "youtube" | "tiktok";

export type ChannelFilter = "all" | Platform;

export type Timeframe = "7d" | "30d" | "90d";

export type DeliverableType =
  | "post"
  | "reel"
  | "story"
  | "video"
  | "short"
  | "carousel";

export type CampaignStatus = "active" | "completed" | "planned";

export interface PlatformAccount {
  handle: string;
  followers: number;
  avgViews: number;
  engagementRate: number;
}

export interface TimeSeriesData {
  date: string;
  instagram: number;
  youtube: number;
  tiktok: number;
  total: number;
}

export interface AgeBucket {
  range: string;
  percent: number;
}

export interface GenderSplit {
  female: number;
  male: number;
  other: number;
}

export interface PlatformDemographics {
  platform: Platform;
  age: AgeBucket[];
  gender: GenderSplit;
  topCountries: { country: string; percent: number }[];
}

export interface Demographics {
  instagram: PlatformDemographics;
  youtube: PlatformDemographics;
  tiktok: PlatformDemographics;
}

export interface Deliverable {
  id: string;
  creatorId: string;
  campaignId: string;
  platform: Platform;
  type: DeliverableType;
  title: string;
  caption: string;
  thumbnail: string;
  url: string;
  publishedAt: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  views: number;
  spend: number;
}

export interface RateCard {
  post: number;
  story: number;
  video: number;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  cover: string;
  location: string;
  niches: string[];
  verified: boolean;
  joinedAt: string;
  platforms: Record<Platform, PlatformAccount>;
  posts: Deliverable[];
  growth: TimeSeriesData[];
  demographics: Demographics;
  rateCard: RateCard;
}

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spend: number;
  objective: string;
  description: string;
  creatorIds: string[];
  deliverableIds: string[];
  platforms: Platform[];
}

export interface MetricTotals {
  impressions: number;
  reach: number;
  views: number;
  interactions: number;
  spend: number;
  emv: number;
  engagementRate: number;
  roi: number;
  cpm: number;
  cpe: number;
}

export interface PlatformShare {
  platform: Platform;
  impressions: number;
  reach: number;
  spend: number;
  emv: number;
}
