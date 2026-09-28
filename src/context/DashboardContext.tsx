"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { campaigns, creators, REFERENCE_DATE } from "@/data/mockData";
import {
  aggregateDeliverables,
  blendDemographics,
  campaignMatchesSearch,
  creatorMetrics,
  filterCreators,
  filterDeliverables,
  followerTotal,
  mergeGrowth,
  platformShares,
  sliceGrowth,
} from "@/lib/calculations";
import type {
  Campaign,
  ChannelFilter,
  Creator,
  Deliverable,
  MetricTotals,
  PlatformDemographics,
  PlatformShare,
  TimeSeriesData,
  Timeframe,
} from "@/types/dashboard";

interface DashboardContextValue {
  channel: ChannelFilter;
  timeframe: Timeframe;
  search: string;
  setChannel: (channel: ChannelFilter) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setSearch: (search: string) => void;
  creators: Creator[];
  campaigns: Campaign[];
  filteredCreators: Creator[];
  filteredPosts: Deliverable[];
  filteredCampaigns: Campaign[];
  totals: MetricTotals;
  shares: PlatformShare[];
  growth: TimeSeriesData[];
  demographics: PlatformDemographics;
  now: Date;
  getCreatorStats: (creator: Creator) => MetricTotals;
  audienceFor: (creator: Creator) => number;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [search, setSearch] = useState("");
  const now = REFERENCE_DATE;

  const filteredCreators = useMemo(
    () => filterCreators(creators, channel, search),
    [channel, search],
  );

  const filteredPosts = useMemo(
    () =>
      filteredCreators.flatMap((creator) =>
        filterDeliverables(creator.posts, channel, timeframe, now),
      ),
    [filteredCreators, channel, timeframe, now],
  );

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) => {
        const hasCreator = campaign.creatorIds.some((id) =>
          filteredCreators.some((creator) => creator.id === id),
        );
        return hasCreator && campaignMatchesSearch(campaign, search);
      }),
    [filteredCreators, search],
  );

  const totals = useMemo(() => aggregateDeliverables(filteredPosts), [filteredPosts]);
  const shares = useMemo(() => platformShares(filteredPosts), [filteredPosts]);
  const growth = useMemo(
    () => sliceGrowth(mergeGrowth(filteredCreators), timeframe, now),
    [filteredCreators, timeframe, now],
  );
  const demographics = useMemo(
    () => blendDemographics(filteredCreators, channel),
    [filteredCreators, channel],
  );

  const getCreatorStats = useCallback(
    (creator: Creator) => creatorMetrics(creator, channel, timeframe, now),
    [channel, timeframe, now],
  );

  const audienceFor = useCallback(
    (creator: Creator) => followerTotal(creator, channel),
    [channel],
  );

  const value = useMemo(
    () => ({
      channel,
      timeframe,
      search,
      setChannel,
      setTimeframe,
      setSearch,
      creators,
      campaigns,
      filteredCreators,
      filteredPosts,
      filteredCampaigns,
      totals,
      shares,
      growth,
      demographics,
      now,
      getCreatorStats,
      audienceFor,
    }),
    [
      channel,
      timeframe,
      search,
      filteredCreators,
      filteredPosts,
      filteredCampaigns,
      totals,
      shares,
      growth,
      demographics,
      now,
      getCreatorStats,
      audienceFor,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
