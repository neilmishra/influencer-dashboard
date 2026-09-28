"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  DollarSign,
  Megaphone,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { DemographicsBarChart } from "@/components/charts/DemographicsBarChart";
import { FollowerGrowthChart } from "@/components/charts/FollowerGrowthChart";
import { PlatformDonutChart } from "@/components/charts/PlatformDonutChart";
import { useDashboard } from "@/context/DashboardContext";
import { campaignMetrics } from "@/lib/calculations";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function OverviewPage() {
  const {
    filteredCreators,
    filteredCampaigns,
    totals,
    shares,
    growth,
    demographics,
    channel,
    timeframe,
    getCreatorStats,
    audienceFor,
    creators,
    now,
  } = useDashboard();

  const leaderboard = [...filteredCreators].sort(
    (a, b) => getCreatorStats(b).emv - getCreatorStats(a).emv,
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
          Network overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          Influencer performance, {timeframe}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Reach, earned media value, and efficiency across the live roster. Filters
          apply instantly to every widget.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={<Users className="h-4 w-4" />}
          label="Total reach"
          value={formatNumber(totals.reach, { compact: true })}
          hint={`${formatNumber(totals.impressions, { compact: true })} impressions`}
        />
        <Kpi
          icon={<DollarSign className="h-4 w-4" />}
          label="Earned media value"
          value={formatCurrency(totals.emv, { compact: true })}
          hint={`${formatCurrency(totals.spend, { compact: true })} spent`}
        />
        <Kpi
          icon={<TrendingUp className="h-4 w-4" />}
          label="Campaign ROI"
          value={formatPercent(totals.roi)}
          hint={`CPM ${formatCurrency(totals.cpm)} · CPE ${formatCurrency(totals.cpe)}`}
        />
        <Kpi
          icon={<Target className="h-4 w-4" />}
          label="Engagement rate"
          value={formatPercent(totals.engagementRate)}
          hint={`${formatNumber(totals.interactions, { compact: true })} interactions`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Follower growth</h2>
              <p className="text-xs text-slate-500">Combined audience by platform</p>
            </div>
          </div>
          <FollowerGrowthChart data={growth} channel={channel} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Platform allocation</h2>
          <p className="mb-2 text-xs text-slate-500">Share of impressions</p>
          <PlatformDonutChart data={shares} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
          <h2 className="text-sm font-semibold text-slate-900">Audience demographics</h2>
          <p className="mb-3 text-xs text-slate-500">
            Age, gender, and top countries weighted by audience
          </p>
          <DemographicsBarChart data={demographics} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Creator leaderboard</h2>
            <Link href="/creators" className="text-xs font-medium text-violet-600">
              View roster
            </Link>
          </div>
          <ol className="space-y-3">
            {leaderboard.map((creator, index) => {
              const stats = getCreatorStats(creator);
              return (
                <li key={creator.id}>
                  <Link
                    href={`/creators/${creator.id}`}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50"
                  >
                    <span className="w-5 text-xs font-semibold text-slate-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {creator.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatNumber(audienceFor(creator), { compact: true })} audience
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(stats.emv, { compact: true })}
                      </p>
                      <p className="text-xs text-emerald-600">{formatPercent(stats.roi)} ROI</p>
                    </div>
                  </Link>
                </li>
              );
            })}
            {leaderboard.length === 0 ? (
              <p className="text-sm text-slate-500">No creators match the current filters.</p>
            ) : null}
          </ol>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-semibold text-slate-900">Campaigns</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {filteredCampaigns.map((campaign) => {
            const metrics = campaignMetrics(campaign, creators, channel, timeframe, now);
            return (
              <article
                key={campaign.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{campaign.name}</p>
                    <p className="text-xs text-slate-500">{campaign.brand}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    {campaign.status}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-600">{campaign.objective}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400">EMV</p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(metrics.emv, { compact: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">ROI</p>
                    <p className="font-semibold text-slate-900">{formatPercent(metrics.roi)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Budget</p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(campaign.budget, { compact: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Reach</p>
                    <p className="font-semibold text-slate-900">
                      {formatNumber(metrics.reach, { compact: true })}
                    </p>
                  </div>
                </div>
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-violet-700">
                  {campaign.creatorIds.length} creators
                  <ArrowUpRight className="h-3 w-3" />
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        {icon}
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
