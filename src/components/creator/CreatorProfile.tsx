"use client";

import { DemographicsBarChart } from "@/components/charts/DemographicsBarChart";
import { FollowerGrowthChart } from "@/components/charts/FollowerGrowthChart";
import { ContentFeed } from "@/components/creator/ContentFeed";
import { CreatorHeader } from "@/components/creator/CreatorHeader";
import { useDashboard } from "@/context/DashboardContext";
import { filterDeliverables, sliceGrowth } from "@/lib/calculations";
import { campaigns } from "@/data/mockData";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function CreatorProfile({ creatorId }: { creatorId: string }) {
  const { creators, channel, timeframe, getCreatorStats, audienceFor, now } =
    useDashboard();
  const creator = creators.find((item) => item.id === creatorId);

  if (!creator) return null;

  const stats = getCreatorStats(creator);
  const posts = filterDeliverables(creator.posts, channel, timeframe, now);
  const growth = sliceGrowth(creator.growth, timeframe, now);
  const demo =
    channel === "all"
      ? creator.demographics.instagram
      : creator.demographics[channel];
  const related = campaigns.filter((campaign) =>
    campaign.creatorIds.includes(creator.id),
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <CreatorHeader creator={creator} audience={audienceFor(creator)} stats={stats} />

      <section className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Impressions" value={formatNumber(stats.impressions, { compact: true })} />
        <MiniStat label="CPM" value={formatCurrency(stats.cpm)} />
        <MiniStat label="CPE" value={formatCurrency(stats.cpe)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
          <h2 className="text-sm font-semibold text-slate-900">Audience growth</h2>
          <p className="mb-3 text-xs text-slate-500">Followers by platform over the selected window</p>
          <FollowerGrowthChart data={growth} channel={channel} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            {channel === "all" ? "Instagram demographics" : `${channel} demographics`}
          </h2>
          <DemographicsBarChart
            data={channel === "all" ? creator.demographics.instagram : demo}
          />
        </div>
      </section>

      {channel === "all" ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">YouTube demographics</h2>
            <DemographicsBarChart data={creator.demographics.youtube} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">TikTok demographics</h2>
            <DemographicsBarChart data={creator.demographics.tiktok} />
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Campaigns</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {related.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-sm font-semibold text-slate-900">{campaign.name}</p>
              <p className="text-xs text-slate-500">{campaign.brand}</p>
              <p className="mt-2 text-xs text-slate-600">{campaign.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Content feed</h2>
        <ContentFeed posts={posts} />
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
