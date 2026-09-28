"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight,
  DollarSign,
  Megaphone,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { campaignMetrics } from "@/lib/calculations";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { Campaign } from "@/types/dashboard";

// ─── Status badge colours ──────────────────────────────────────────────────
const STATUS_STYLES: Record<
  Campaign["status"],
  { bg: string; text: string; dot: string }
> = {
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  planned: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
};

// ─── Platform chips ────────────────────────────────────────────────────────
const PLATFORM_CHIP: Record<string, { label: string; colour: string }> = {
  instagram: { label: "IG", colour: "bg-pink-100 text-pink-700" },
  youtube: { label: "YT", colour: "bg-red-100 text-red-700" },
  tiktok: { label: "TT", colour: "bg-slate-900 text-white" },
};

// ─── Custom Recharts tooltip ───────────────────────────────────────────────
interface ChartEntry {
  name?: string;
  value?: number;
  color?: string;
}
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ChartEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-slate-700">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
          {entry.name}:{" "}
          <span className="font-semibold">
            {formatCurrency(entry.value ?? 0, { compact: true })}
          </span>
        </p>
      ))}
    </div>
  );
}

// ─── KPI tile ─────────────────────────────────────────────────────────────
function Kpi({
  icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        accent
          ? "border-violet-200 bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
          accent ? "bg-white/20 text-white" : "bg-violet-50 text-violet-700"
        }`}
      >
        {icon}
      </div>
      <p
        className={`text-xs font-medium uppercase tracking-wide ${
          accent ? "text-violet-200" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          accent ? "text-white" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-xs ${accent ? "text-violet-200" : "text-slate-500"}`}
      >
        {hint}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const { campaigns, creators, channel, timeframe, now } = useDashboard();

  // Per-campaign derived data
  const campaignData = campaigns.map((campaign) => {
    const metrics = campaignMetrics(campaign, creators, channel, timeframe, now);
    const spendPct =
      campaign.budget > 0 ? campaign.spend / campaign.budget : 0;
    return { campaign, metrics, spendPct };
  });

  // Aggregate KPIs
  const active = campaignData.filter((c) => c.campaign.status === "active");
  const totalActiveBudget = active.reduce(
    (s, c) => s + c.campaign.budget,
    0,
  );
  const totalEmv = campaignData.reduce((s, c) => s + c.metrics.emv, 0);
  const totalSpend = campaignData.reduce(
    (s, c) => s + c.campaign.spend,
    0,
  );
  const blendedRoi =
    totalSpend > 0 ? (totalEmv - totalSpend) / totalSpend : 0;
  const totalDeliverables = campaigns.reduce(
    (s, c) => s + c.deliverableIds.length,
    0,
  );

  // Recharts data
  const chartData = campaigns.map((campaign) => ({
    name:
      campaign.name.length > 18
        ? campaign.name.slice(0, 18) + "\u2026"
        : campaign.name,
    "Target Budget": campaign.budget,
    "Actual Spend": campaign.spend,
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* ── Page header ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
          Campaign analytics
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          All campaigns
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Budget pacing, earned media value, and ROI across every active and
          historical flight. Filters apply globally.
        </p>
      </div>

      {/* ── KPI tiles ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={<DollarSign className="h-4 w-4" />}
          label="Total active budget"
          value={formatCurrency(totalActiveBudget, { compact: true })}
          hint={`${active.length} active campaign${active.length !== 1 ? "s" : ""}`}
          accent
        />
        <Kpi
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total return (EMV)"
          value={formatCurrency(totalEmv, { compact: true })}
          hint={`vs. ${formatCurrency(totalSpend, { compact: true })} spent`}
        />
        <Kpi
          icon={<Zap className="h-4 w-4" />}
          label="Overall blended ROI"
          value={formatPercent(blendedRoi)}
          hint="Across all campaigns"
        />
        <Kpi
          icon={<Megaphone className="h-4 w-4" />}
          label="Total deliverables"
          value={formatNumber(totalDeliverables)}
          hint={`Across ${campaigns.length} campaigns`}
        />
      </section>

      {/* ── Campaign cards ── */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Campaign roster
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaignData.map(({ campaign, metrics, spendPct }) => {
            const s = STATUS_STYLES[campaign.status];
            const cappedPct = Math.min(spendPct, 1);
            return (
              <article
                key={campaign.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-5 pb-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-violet-700">
                      {campaign.name}
                    </p>
                    <p className="text-xs text-slate-500">{campaign.brand}</p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${s.bg} ${s.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {campaign.status}
                  </span>
                </div>

                {/* Objective */}
                <p className="line-clamp-2 px-5 text-xs leading-5 text-slate-500">
                  {campaign.objective}
                </p>

                {/* Spend progress bar */}
                <div className="px-5 pt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                    <span>Budget pacing</span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(campaign.spend, { compact: true })}{" "}
                      <span className="text-slate-400">
                        /{" "}
                        {formatCurrency(campaign.budget, { compact: true })}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        cappedPct >= 0.9
                          ? "bg-rose-500"
                          : cappedPct >= 0.7
                            ? "bg-amber-400"
                            : "bg-violet-500"
                      }`}
                      style={{ width: `${cappedPct * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] text-slate-400">
                    {formatPercent(spendPct, {
                      alreadyPercent: true,
                      digits: 1,
                    })}{" "}
                    paced
                  </p>
                </div>

                {/* Mini metrics */}
                <div className="mx-5 mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 px-4 py-3 text-center text-xs">
                  <div>
                    <p className="text-slate-400">EMV</p>
                    <p className="mt-0.5 font-semibold text-slate-800">
                      {formatCurrency(metrics.emv, { compact: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">ROI</p>
                    <p
                      className={`mt-0.5 font-semibold ${
                        metrics.roi >= 0
                          ? "text-emerald-700"
                          : "text-rose-600"
                      }`}
                    >
                      {formatPercent(metrics.roi)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Reach</p>
                    <p className="mt-0.5 font-semibold text-slate-800">
                      {formatNumber(metrics.reach, { compact: true })}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-2">
                    {campaign.platforms.map((p) => {
                      const chip = PLATFORM_CHIP[p];
                      return chip ? (
                        <span
                          key={p}
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${chip.colour}`}
                        >
                          {chip.label}
                        </span>
                      ) : null;
                    })}
                    <span className="text-xs text-slate-400">
                      {campaign.creatorIds.length} creator
                      {campaign.creatorIds.length !== 1 ? "s" : ""}
                      {" \u00b7 "}
                      {campaign.deliverableIds.length} deliverables
                    </span>
                  </div>
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800"
                    id={`campaign-link-${campaign.id}`}
                  >
                    Deep-dive
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Budget vs Spend chart ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-1">
          <h2 className="text-sm font-semibold text-slate-900">
            Budget vs spend comparison
          </h2>
          <p className="text-xs text-slate-500">
            Target allocation against actual spend per campaign
          </p>
        </div>
        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barCategoryGap="28%"
              barGap={4}
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  formatCurrency(v, { compact: true })
                }
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "#f8fafc" }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: 12,
                  color: "#64748b",
                  paddingTop: 12,
                }}
              />
              <Bar
                dataKey="Target Budget"
                fill="#ddd6fe"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="Actual Spend"
                fill="#7c3aed"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
