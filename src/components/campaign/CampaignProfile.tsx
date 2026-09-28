"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Film,
  Image as ImageIcon,
  MapPin,
  Tv2,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import {
  aggregateDeliverables,
  calculateCPE,
  calculateCPM,
  calculateEMV,
  calculateROI,
  getInteractions,
} from "@/lib/calculations";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/utils";
import type { Campaign, Creator, Deliverable, Platform } from "@/types/dashboard";

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<
  Campaign["status"],
  { bg: string; text: string; ring: string; dot: string }
> = {
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
  },
  completed: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    ring: "ring-slate-200",
    dot: "bg-slate-400",
  },
  planned: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    dot: "bg-amber-400",
  },
};

const PLATFORM_META: Record<
  Platform,
  { label: string; colour: string; bg: string; Icon: typeof Film }
> = {
  instagram: {
    label: "Instagram",
    colour: "text-pink-600",
    bg: "bg-pink-50",
    Icon: ImageIcon,
  },
  youtube: {
    label: "YouTube",
    colour: "text-red-600",
    bg: "bg-red-50",
    Icon: Tv2,
  },
  tiktok: {
    label: "TikTok",
    colour: "text-slate-800",
    bg: "bg-slate-100",
    Icon: Film,
  },
};

// ─── Small helpers ────────────────────────────────────────────────────────────
function MiniStat({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        highlight
          ? "border-violet-200 bg-gradient-to-br from-violet-600 to-indigo-600"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-[11px] font-medium uppercase tracking-wide ${
          highlight ? "text-violet-200" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-xl font-semibold ${
          highlight ? "text-white" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      {sub ? (
        <p
          className={`mt-0.5 text-xs ${
            highlight ? "text-violet-200" : "text-slate-500"
          }`}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}

// ─── Radar tooltip ────────────────────────────────────────────────────────────
interface RadarEntry {
  name?: string;
  value?: number;
}
function RadarTip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: RadarEntry[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-800">{payload[0]?.name}</p>
      <p className="text-slate-500">
        Score:{" "}
        <span className="font-semibold text-violet-700">
          {(payload[0]?.value ?? 0).toFixed(1)}
        </span>
      </p>
    </div>
  );
}

// ─── Deliverable type icon ────────────────────────────────────────────────────
function DeliverableRow({ post }: { post: Deliverable }) {
  const meta = PLATFORM_META[post.platform];
  const Icon = meta.Icon;
  const interactions = getInteractions(post);
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.colour}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-800">
          {post.title}
        </p>
        <p className="text-[11px] text-slate-400">
          {formatDate(post.publishedAt)} &middot; {post.type}
        </p>
      </div>
      <div className="text-right text-xs">
        <p className="font-semibold text-slate-800">
          {formatNumber(interactions, { compact: true })}
        </p>
        <p className="text-slate-400">interactions</p>
      </div>
    </div>
  );
}

// ─── Inline ROI Calculator ────────────────────────────────────────────────────
function ROICalculator({
  baseSpend,
  baseImpressions,
  baseInteractions,
}: {
  baseSpend: number;
  baseImpressions: number;
  baseInteractions: number;
}) {
  // Slider: 50% → 200% of base spend
  const [multiplier, setMultiplier] = useState(100); // integer, 50..200

  const adjustedSpend = (baseSpend * multiplier) / 100;
  const emv = calculateEMV(baseImpressions, baseInteractions);
  const cpm = calculateCPM(adjustedSpend, baseImpressions);
  const cpe = calculateCPE(adjustedSpend, baseInteractions);
  const roi = calculateROI(emv, adjustedSpend);

  // Clamp for the progress track fill
  const sliderFill = ((multiplier - 50) / 150) * 100;

  const delta = adjustedSpend - baseSpend;
  const isOver = delta > 0;

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
            Live ROI simulator
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Budget scenario explorer
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Drag to model how spend changes affect efficiency metrics
          </p>
        </div>
        <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
          <p className="text-2xl font-bold text-white">{multiplier}%</p>
          <p className="text-[11px] text-slate-400">of base</p>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>50% ({formatCurrency(baseSpend * 0.5, { compact: true })})</span>
          <span className="font-medium text-white">
            {formatCurrency(adjustedSpend, { compact: true })}
          </span>
          <span>200% ({formatCurrency(baseSpend * 2, { compact: true })})</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-violet-500 transition-all"
            style={{ width: `${sliderFill}%` }}
          />
        </div>
        <input
          id="roi-budget-slider"
          type="range"
          min={50}
          max={200}
          step={5}
          value={multiplier}
          onChange={(e) => setMultiplier(Number(e.target.value))}
          className="mt-2 w-full cursor-pointer accent-violet-500"
          aria-label="Budget multiplier"
        />
        <p className="mt-1 text-center text-xs text-slate-400">
          {isOver ? (
            <span className="text-rose-400">
              +{formatCurrency(Math.abs(delta), { compact: true })} over base
            </span>
          ) : delta < 0 ? (
            <span className="text-emerald-400">
              {formatCurrency(Math.abs(delta), { compact: true })} under base
            </span>
          ) : (
            <span className="text-slate-400">At base spend</span>
          )}
        </p>
      </div>

      {/* Output metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricTile
          label="CPM"
          value={formatCurrency(cpm)}
          sub="per 1k impressions"
          good={cpm <= calculateCPM(baseSpend, baseImpressions)}
        />
        <MetricTile
          label="CPE"
          value={formatCurrency(cpe)}
          sub="per engagement"
          good={cpe <= calculateCPE(baseSpend, baseInteractions)}
        />
        <MetricTile
          label="EMV"
          value={formatCurrency(emv, { compact: true })}
          sub="earned media value"
          neutral
        />
        <MetricTile
          label="ROI"
          value={formatPercent(roi)}
          sub="return on spend"
          good={roi >= 0}
        />
      </div>

      {/* Insight callout */}
      <div className="mt-4 rounded-xl bg-white/5 px-4 py-3">
        <p className="text-xs text-slate-300">
          <span className="font-semibold text-violet-300">Insight: </span>
          At {multiplier}% budget ({formatCurrency(adjustedSpend, { compact: true })}
          ), every $1 spent generates{" "}
          <span className="font-semibold text-white">
            {roi >= 0 ? `$${(roi + 1).toFixed(2)}` : `$${Math.max(0, roi + 1).toFixed(2)}`}
          </span>{" "}
          in earned media value —{" "}
          {roi >= calculateROI(emv, baseSpend)
            ? "better than the base scenario."
            : "below the base scenario."}
        </p>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  sub,
  good,
  neutral = false,
}: {
  label: string;
  value: string;
  sub: string;
  good?: boolean;
  neutral?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-bold ${
          neutral
            ? "text-white"
            : good
              ? "text-emerald-400"
              : "text-rose-400"
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CampaignProfile({ campaignId }: { campaignId: string }) {
  const { campaigns, creators, channel, timeframe, now } = useDashboard();

  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) return null;

  // Creators assigned to this campaign
  const assignedCreators = creators.filter((c) =>
    campaign.creatorIds.includes(c.id),
  );

  // All deliverables for this campaign
  const allPosts = assignedCreators
    .flatMap((c) => c.posts)
    .filter((p) => campaign.deliverableIds.includes(p.id));

  const metrics = aggregateDeliverables(allPosts);

  const s = STATUS_STYLES[campaign.status];

  // Radar data – normalised 0-10 scores for a visual fingerprint
  const maxEmv = 1_000_000;
  const radarData = [
    {
      metric: "EMV",
      score: Math.min((metrics.emv / maxEmv) * 10, 10),
    },
    {
      metric: "ROI",
      score: Math.min(Math.max((metrics.roi / 5) * 10, 0), 10),
    },
    {
      metric: "Reach",
      score: Math.min((metrics.reach / 5_000_000) * 10, 10),
    },
    {
      metric: "ER",
      score: Math.min((metrics.engagementRate / 0.1) * 10, 10),
    },
    {
      metric: "Efficiency",
      score: Math.min(10 / Math.max(metrics.cpm, 0.01), 10),
    },
  ];

  // Per-creator post lists for checklist
  const creatorPostMap = useMemo(() => {
    const map = new Map<string, Deliverable[]>();
    for (const creator of assignedCreators) {
      const posts = creator.posts.filter((p) =>
        campaign.deliverableIds.includes(p.id),
      );
      if (posts.length > 0) map.set(creator.id, posts);
    }
    return map;
  }, [assignedCreators, campaign.deliverableIds]);

  const spendPct =
    campaign.budget > 0 ? campaign.spend / campaign.budget : 0;
  const cappedPct = Math.min(spendPct, 1);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1 text-xs text-slate-500">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-violet-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Campaigns
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-medium text-slate-800">{campaign.name}</span>
      </nav>

      {/* ── Campaign hero header ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
          <div className="flex-1 min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${s.bg} ${s.text} ${s.ring}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                {campaign.status}
              </span>
              {campaign.platforms.map((p) => {
                const meta = PLATFORM_META[p];
                return (
                  <span
                    key={p}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.bg} ${meta.colour}`}
                  >
                    {meta.label}
                  </span>
                );
              })}
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {campaign.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {campaign.brand}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {campaign.description}
            </p>
          </div>

          {/* Date + budget at-a-glance */}
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              {formatDate(campaign.startDate)} &ndash;{" "}
              {formatDate(campaign.endDate)}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Budget
              </p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(campaign.budget, { compact: true })}
              </p>
              <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-1.5 rounded-full ${
                    cappedPct >= 0.9
                      ? "bg-rose-500"
                      : cappedPct >= 0.7
                        ? "bg-amber-400"
                        : "bg-violet-500"
                  }`}
                  style={{ width: `${cappedPct * 100}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {formatCurrency(campaign.spend, { compact: true })} spent (
                {formatPercent(spendPct, {
                  alreadyPercent: true,
                  digits: 0,
                })}
                )
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Core metric tiles ── */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MiniStat
          label="Impressions"
          value={formatNumber(metrics.impressions, { compact: true })}
          sub="total views"
          highlight
        />
        <MiniStat
          label="Reach"
          value={formatNumber(metrics.reach, { compact: true })}
          sub="unique accounts"
        />
        <MiniStat
          label="EMV"
          value={formatCurrency(metrics.emv, { compact: true })}
          sub="earned media value"
        />
        <MiniStat
          label="ROI"
          value={formatPercent(metrics.roi)}
          sub="return on spend"
        />
        <MiniStat
          label="CPM"
          value={formatCurrency(metrics.cpm)}
          sub="cost per mille"
        />
        <MiniStat
          label="CPE"
          value={formatCurrency(metrics.cpe)}
          sub="cost per engagement"
        />
      </section>

      {/* ── ROI Calculator + Radar ── */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ROICalculator
            baseSpend={campaign.spend}
            baseImpressions={metrics.impressions}
            baseInteractions={metrics.interactions}
          />
        </div>

        {/* Campaign performance radar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Performance fingerprint
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Normalised 0–10 scores per dimension
          </p>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#7c3aed"
                  fill="#7c3aed"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Tooltip content={<RadarTip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Creator progress checklists ── */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Creator deliverable checklists
          </h2>
          <p className="text-xs text-slate-500">
            All published content items assigned to this campaign, grouped by
            creator
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {assignedCreators.map((creator) => {
            const posts = creatorPostMap.get(creator.id) ?? [];
            if (posts.length === 0) return null;

            const creatorStats = aggregateDeliverables(posts);

            return (
              <div
                key={creator.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Creator row */}
                <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                  <div className="relative h-10 w-10 shrink-0">
                    {/* Avatar via picsum */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    {creator.verified && (
                      <BadgeCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-violet-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {creator.name}
                      </p>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" />
                      {creator.location}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold text-slate-800">
                      {formatCurrency(creatorStats.emv, { compact: true })}
                    </p>
                    <p className="text-slate-400">EMV</p>
                  </div>
                  <Link
                    href={`/creators/${creator.id}`}
                    className="ml-1 shrink-0 rounded-lg bg-slate-50 p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                    aria-label={`View ${creator.name} profile`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Progress summary bar */}
                <div className="border-b border-slate-100 px-4 py-2.5">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {posts.length} deliverable
                      {posts.length !== 1 ? "s" : ""} completed
                    </span>
                    <span className="font-medium text-emerald-600">
                      {formatPercent(1, { alreadyPercent: true, digits: 0 })} done
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: "100%" }} />
                  </div>
                </div>

                {/* Deliverable list */}
                <div className="divide-y divide-slate-50 px-2 py-1">
                  {posts.map((post) => (
                    <DeliverableRow key={post.id} post={post} />
                  ))}
                </div>

                {/* Creator stats footer */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 text-center text-xs">
                  <div className="py-2.5">
                    <p className="text-slate-400">Impressions</p>
                    <p className="font-semibold text-slate-700">
                      {formatNumber(creatorStats.impressions, { compact: true })}
                    </p>
                  </div>
                  <div className="py-2.5">
                    <p className="text-slate-400">ROI</p>
                    <p
                      className={`font-semibold ${
                        creatorStats.roi >= 0
                          ? "text-emerald-600"
                          : "text-rose-500"
                      }`}
                    >
                      {formatPercent(creatorStats.roi)}
                    </p>
                  </div>
                  <div className="py-2.5">
                    <p className="text-slate-400">ER</p>
                    <p className="font-semibold text-slate-700">
                      {formatPercent(creatorStats.engagementRate)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
