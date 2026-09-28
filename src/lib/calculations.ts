import type {
  Campaign,
  ChannelFilter,
  Creator,
  Deliverable,
  Demographics,
  MetricTotals,
  Platform,
  PlatformDemographics,
  PlatformShare,
  TimeSeriesData,
  Timeframe,
} from "@/types/dashboard";

const IMPRESSION_VALUE = 0.02;
const INTERACTION_VALUE = 0.25;

export function safeDivide(numerator: number, denominator: number): number {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return 0;
  }
  return numerator / denominator;
}

export function getInteractions(deliverable: Deliverable): number {
  return (
    deliverable.likes +
    deliverable.comments +
    deliverable.shares +
    deliverable.saves +
    deliverable.clicks
  );
}

export function calculateEngagementRate(
  interactions: number,
  impressions: number,
): number {
  return safeDivide(interactions, impressions);
}

export function calculateEMV(impressions: number, interactions: number): number {
  return impressions * IMPRESSION_VALUE + interactions * INTERACTION_VALUE;
}

export function calculateROI(earnedMediaValue: number, spend: number): number {
  return safeDivide(earnedMediaValue - spend, spend);
}

export function calculateCPM(spend: number, impressions: number): number {
  return safeDivide(spend, impressions) * 1000;
}

export function calculateCPE(spend: number, interactions: number): number {
  return safeDivide(spend, interactions);
}

export function timeframeDays(timeframe: Timeframe): number {
  switch (timeframe) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
  }
}

export function getTimeframeStart(timeframe: Timeframe, now = new Date()): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (timeframeDays(timeframe) - 1));
  return start;
}

export function isWithinTimeframe(
  isoDate: string,
  timeframe: Timeframe,
  now = new Date(),
): boolean {
  const value = new Date(isoDate);
  if (Number.isNaN(value.getTime())) return false;
  return value >= getTimeframeStart(timeframe, now);
}

export function matchesSearch(creator: Creator, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    creator.name,
    creator.handle,
    creator.bio,
    creator.location,
    ...creator.niches,
    ...Object.values(creator.platforms).map((account) => account.handle),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function campaignMatchesSearch(campaign: Campaign, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [campaign.name, campaign.brand, campaign.objective, campaign.description]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function filterDeliverables(
  posts: Deliverable[],
  channel: ChannelFilter,
  timeframe: Timeframe,
  now = new Date(),
): Deliverable[] {
  return posts.filter((post) => {
    const channelOk = channel === "all" || post.platform === channel;
    return channelOk && isWithinTimeframe(post.publishedAt, timeframe, now);
  });
}

export function sliceGrowth(
  series: TimeSeriesData[],
  timeframe: Timeframe,
  now = new Date(),
): TimeSeriesData[] {
  return series.filter((point) => isWithinTimeframe(point.date, timeframe, now));
}

export function filterCreators(
  creators: Creator[],
  channel: ChannelFilter,
  search: string,
): Creator[] {
  return creators.filter((creator) => {
    if (!matchesSearch(creator, search)) return false;
    if (channel === "all") return true;
    return creator.platforms[channel].followers > 0;
  });
}

export function aggregateDeliverables(posts: Deliverable[]): MetricTotals {
  const impressions = posts.reduce((sum, post) => sum + post.impressions, 0);
  const reach = posts.reduce((sum, post) => sum + post.reach, 0);
  const views = posts.reduce((sum, post) => sum + post.views, 0);
  const interactions = posts.reduce((sum, post) => sum + getInteractions(post), 0);
  const spend = posts.reduce((sum, post) => sum + post.spend, 0);
  const emv = calculateEMV(impressions, interactions);

  return {
    impressions,
    reach,
    views,
    interactions,
    spend,
    emv,
    engagementRate: calculateEngagementRate(interactions, impressions),
    roi: calculateROI(emv, spend),
    cpm: calculateCPM(spend, impressions),
    cpe: calculateCPE(spend, interactions),
  };
}

export function platformShares(posts: Deliverable[]): PlatformShare[] {
  const platforms: Platform[] = ["instagram", "youtube", "tiktok"];
  return platforms.map((platform) => {
    const subset = posts.filter((post) => post.platform === platform);
    const impressions = subset.reduce((sum, post) => sum + post.impressions, 0);
    const reach = subset.reduce((sum, post) => sum + post.reach, 0);
    const spend = subset.reduce((sum, post) => sum + post.spend, 0);
    const interactions = subset.reduce((sum, post) => sum + getInteractions(post), 0);
    return {
      platform,
      impressions,
      reach,
      spend,
      emv: calculateEMV(impressions, interactions),
    };
  });
}

export function followerTotal(creator: Creator, channel: ChannelFilter): number {
  if (channel === "all") {
    return (
      creator.platforms.instagram.followers +
      creator.platforms.youtube.followers +
      creator.platforms.tiktok.followers
    );
  }
  return creator.platforms[channel].followers;
}

export function blendDemographics(
  creators: Creator[],
  channel: ChannelFilter,
): PlatformDemographics {
  const blocks =
    channel === "all"
      ? creators.flatMap((creator) => [
          creator.demographics.instagram,
          creator.demographics.youtube,
          creator.demographics.tiktok,
        ])
      : creators.map((creator) => creator.demographics[channel]);

  const weights = blocks.map((block) => {
    const creator = creators.find((item) =>
      Object.values(item.demographics).includes(block),
    );
    if (!creator) return 1;
    return followerTotal(creator, block.platform);
  });

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const ageRanges = ["13-17", "18-24", "25-34", "35-44", "45+"];

  const age = ageRanges.map((range) => {
    const percent =
      blocks.reduce((sum, block, index) => {
        const bucket = block.age.find((item) => item.range === range);
        return sum + (bucket?.percent ?? 0) * weights[index];
      }, 0) / totalWeight;
    return { range, percent };
  });

  const gender = {
    female:
      blocks.reduce(
        (sum, block, index) => sum + block.gender.female * weights[index],
        0,
      ) / totalWeight,
    male:
      blocks.reduce(
        (sum, block, index) => sum + block.gender.male * weights[index],
        0,
      ) / totalWeight,
    other:
      blocks.reduce(
        (sum, block, index) => sum + block.gender.other * weights[index],
        0,
      ) / totalWeight,
  };

  const countryMap = new Map<string, number>();
  blocks.forEach((block, index) => {
    block.topCountries.forEach((country) => {
      countryMap.set(
        country.country,
        (countryMap.get(country.country) ?? 0) + country.percent * weights[index],
      );
    });
  });

  const topCountries = Array.from(countryMap.entries())
    .map(([country, weighted]) => ({
      country,
      percent: weighted / totalWeight,
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);

  return {
    platform: channel === "all" ? "instagram" : channel,
    age,
    gender,
    topCountries,
  };
}

export function mergeGrowth(creators: Creator[]): TimeSeriesData[] {
  const byDate = new Map<string, TimeSeriesData>();
  creators.forEach((creator) => {
    creator.growth.forEach((point) => {
      const existing = byDate.get(point.date) ?? {
        date: point.date,
        instagram: 0,
        youtube: 0,
        tiktok: 0,
        total: 0,
      };
      existing.instagram += point.instagram;
      existing.youtube += point.youtube;
      existing.tiktok += point.tiktok;
      existing.total += point.total;
      byDate.set(point.date, existing);
    });
  });
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function creatorMetrics(
  creator: Creator,
  channel: ChannelFilter,
  timeframe: Timeframe,
  now = new Date(),
): MetricTotals {
  return aggregateDeliverables(
    filterDeliverables(creator.posts, channel, timeframe, now),
  );
}

export function campaignMetrics(
  campaign: Campaign,
  creators: Creator[],
  channel: ChannelFilter,
  timeframe: Timeframe,
  now = new Date(),
): MetricTotals {
  const posts = creators
    .filter((creator) => campaign.creatorIds.includes(creator.id))
    .flatMap((creator) => creator.posts)
    .filter((post) => campaign.deliverableIds.includes(post.id));
  return aggregateDeliverables(filterDeliverables(posts, channel, timeframe, now));
}

export function emptyDemographics(): Demographics {
  const emptyBlock = (platform: Platform): PlatformDemographics => ({
    platform,
    age: [
      { range: "13-17", percent: 0 },
      { range: "18-24", percent: 0 },
      { range: "25-34", percent: 0 },
      { range: "35-44", percent: 0 },
      { range: "45+", percent: 0 },
    ],
    gender: { female: 0, male: 0, other: 0 },
    topCountries: [],
  });

  return {
    instagram: emptyBlock("instagram"),
    youtube: emptyBlock("youtube"),
    tiktok: emptyBlock("tiktok"),
  };
}
