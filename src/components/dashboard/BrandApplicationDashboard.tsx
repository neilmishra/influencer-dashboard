"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Camera,
  Check,
  LoaderCircle,
  Mail,
  MapPin,
  Music2,
  Play,
  Users,
  X,
} from "lucide-react";

type ApplicationStatus = "PENDING" | "ACCEPTED" | "DECLINED";
type PlatformName = "YouTube" | "Instagram" | "TikTok";

interface CreatorApplicationSummary {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  creator: {
    name: string;
    handle: string;
    publicContactEmail: string | null;
    followers: number;
    category: string;
    youtubeFollowers: number | null;
    youtubeAverageViews: number | null;
    instagramFollowers: number | null;
    instagramAverageEngagementRate: number | null;
    tiktokFollowers: number | null;
    tiktokAverageLikes: number | null;
    verifiedPlatforms: PlatformName[];
  };
}

interface BrandCampaignSummary {
  id: string;
  title: string;
  description: string;
  niche: string;
  platforms: string[];
  budgetRange: string;
  createdAt: string;
  applications: CreatorApplicationSummary[];
}

const platformDetails = [
  {
    name: "YouTube",
    Icon: Play,
    followers: (creator: CreatorApplicationSummary["creator"]) => creator.youtubeFollowers,
    metric: (creator: CreatorApplicationSummary["creator"]) =>
      creator.youtubeAverageViews === null ? null : `${formatNumber(creator.youtubeAverageViews)} avg views`,
  },
  {
    name: "Instagram",
    Icon: Camera,
    followers: (creator: CreatorApplicationSummary["creator"]) => creator.instagramFollowers,
    metric: (creator: CreatorApplicationSummary["creator"]) =>
      creator.instagramAverageEngagementRate === null
        ? null
        : `${creator.instagramAverageEngagementRate.toFixed(1)}% engagement`,
  },
  {
    name: "TikTok",
    Icon: Music2,
    followers: (creator: CreatorApplicationSummary["creator"]) => creator.tiktokFollowers,
    metric: (creator: CreatorApplicationSummary["creator"]) =>
      creator.tiktokAverageLikes === null ? null : `${formatNumber(creator.tiktokAverageLikes)} avg likes`,
  },
] as const;

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function statusLabel(status: ApplicationStatus) {
  if (status === "ACCEPTED") return "Accepted";
  if (status === "DECLINED") return "Declined";
  return "Pending";
}

export function BrandApplicationDashboard({
  campaigns,
}: {
  campaigns: BrandCampaignSummary[];
}) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id ?? "");
  const [applicationStatuses, setApplicationStatuses] = useState<Record<string, ApplicationStatus>>({});
  const [savingApplicationId, setSavingApplicationId] = useState<string | null>(null);
  const [applicationErrors, setApplicationErrors] = useState<Record<string, string>>({});
  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId);

  async function updateApplicationStatus(applicationId: string, nextStatus: Exclude<ApplicationStatus, "PENDING">) {
    const previousStatus = applicationStatuses[applicationId] ??
      campaigns.flatMap((campaign) => campaign.applications).find((application) => application.id === applicationId)?.status;
    if (!previousStatus || previousStatus !== "PENDING" || savingApplicationId) return;

    setSavingApplicationId(applicationId);
    setApplicationErrors((current) => ({ ...current, [applicationId]: "" }));
    setApplicationStatuses((current) => ({ ...current, [applicationId]: nextStatus }));

    try {
      const response = await fetch(`/api/applications/${encodeURIComponent(applicationId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
            ? result.error
            : "Could not update this application.";
        setApplicationStatuses((current) => ({ ...current, [applicationId]: previousStatus }));
        setApplicationErrors((current) => ({ ...current, [applicationId]: message }));
      }
    } catch {
      setApplicationStatuses((current) => ({ ...current, [applicationId]: previousStatus }));
      setApplicationErrors((current) => ({
        ...current,
        [applicationId]: "Could not reach the application service. Try again.",
      }));
    } finally {
      setSavingApplicationId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">Brand workspace</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Application manager</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review creator interest and manage your campaign applicants.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          <Building2 aria-hidden="true" className="h-4 w-4" />
          Post a campaign
        </Link>
      </header>

      {campaigns.length === 0 ? (
        <section className="border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Building2 aria-hidden="true" className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">No campaigns yet</h2>
          <p className="mt-1 text-sm text-slate-500">Post a campaign to start receiving creator applications.</p>
          <Link href="/campaigns/new" className="mt-4 inline-flex text-sm font-semibold text-violet-700 hover:text-violet-900">
            Create your first campaign <ArrowUpRight aria-hidden="true" className="ml-1 h-4 w-4" />
          </Link>
        </section>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside aria-label="Your campaigns" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Your campaigns</h2>
              <span className="text-xs text-slate-500">{campaigns.length} total</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {campaigns.map((campaign) => {
                const isSelected = campaign.id === selectedCampaignId;
                const pendingCount = campaign.applications.filter(
                  (application) => (applicationStatuses[application.id] ?? application.status) === "PENDING",
                ).length;

                return (
                  <button
                    key={campaign.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCampaignId(campaign.id)}
                    className={`min-w-64 border p-4 text-left transition lg:min-w-0 ${isSelected ? "border-violet-400 bg-violet-50 ring-1 ring-violet-100" : "border-slate-200 bg-white hover:border-slate-400"}`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-950">{campaign.title}</span>
                        <span className="mt-1 block text-xs text-slate-500">{campaign.niche} · {formatDate(campaign.createdAt)}</span>
                      </span>
                      <span className="shrink-0 border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
                        {pendingCount} new
                      </span>
                    </span>
                    <span className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <Users aria-hidden="true" className="h-3.5 w-3.5" />
                      {campaign.applications.length} applicant{campaign.applications.length === 1 ? "" : "s"}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {selectedCampaign ? (
            <section aria-label={`Applicants for ${selectedCampaign.title}`} className="min-w-0 space-y-4">
              <header className="border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-violet-700">{selectedCampaign.niche}</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">{selectedCampaign.title}</h2>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-600">
                    <Users aria-hidden="true" className="h-4 w-4" />
                    {selectedCampaign.applications.length} applicants
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">{selectedCampaign.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">{selectedCampaign.budgetRange}</span>
                  <span aria-hidden="true">·</span>
                  {selectedCampaign.platforms.map((platform) => (
                    <span key={platform} className="border border-slate-200 px-2 py-1">{platform}</span>
                  ))}
                </div>
              </header>

              {selectedCampaign.applications.length === 0 ? (
                <div className="border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                  <Users aria-hidden="true" className="mx-auto h-7 w-7 text-slate-400" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">No applicants yet</h3>
                  <p className="mt-1 text-sm text-slate-500">New creator applications will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                  {selectedCampaign.applications.map((application) => {
                    const creator = application.creator;
                    const status = applicationStatuses[application.id] ?? application.status;
                    const isSaving = savingApplicationId === application.id;
                    const portfolioHref = `/p/${encodeURIComponent(creator.handle.replace(/^@/, ""))}`;

                    return (
                      <article key={application.id} className="flex min-w-0 flex-col border border-slate-200 bg-white p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-slate-950">{creator.name}</p>
                            <p className="mt-0.5 truncate text-sm text-slate-500">{creator.handle}</p>
                          </div>
                          <span className={`shrink-0 border px-2 py-1 text-[11px] font-semibold ${status === "ACCEPTED" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : status === "DECLINED" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                            {statusLabel(status)}
                          </span>
                        </div>

                        <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-slate-600">
                          <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                          {creator.publicContactEmail ? (
                            <a href={`mailto:${creator.publicContactEmail}`} className="truncate hover:text-violet-800">
                              {creator.publicContactEmail}
                            </a>
                          ) : (
                            <span className="text-slate-400">Public email not provided</span>
                          )}
                        </div>
                        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                          {creator.category} · {formatNumber(creator.followers)} total followers
                        </p>

                        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-3">
                          {platformDetails.map(({ name, Icon, followers, metric }) => {
                            const followerCount = followers(creator);
                            const metricText = metric(creator);
                            const isVerified = creator.verifiedPlatforms.includes(name);
                            const hasReportedMetrics = followerCount !== null || metricText !== null;

                            return (
                              <div key={name} className="min-w-0 px-2 first:pl-0 last:pr-0">
                                <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                                  <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{name}</span>
                                </p>
                                <p className="mt-2 truncate text-sm font-semibold text-slate-950">
                                  {followerCount === null ? "—" : formatNumber(followerCount)}
                                </p>
                                <p className="mt-0.5 min-h-4 truncate text-[10px] text-slate-500">
                                  {metricText ?? "followers"}
                                </p>
                                <span className={`mt-2 inline-flex items-center gap-1 text-[9px] font-semibold ${isVerified ? "text-emerald-700" : hasReportedMetrics ? "text-slate-500" : "text-slate-400"}`}>
                                  {isVerified ? <BadgeCheck aria-hidden="true" className="h-3 w-3" /> : null}
                                  {isVerified ? "Verified" : hasReportedMetrics ? "Self-reported" : "No data"}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                          <Link
                            href={portfolioHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 transition hover:text-violet-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                          >
                            View Full Portfolio <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                          </Link>

                          {status === "PENDING" ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => void updateApplicationStatus(application.id, "ACCEPTED")}
                                className="inline-flex min-h-9 items-center justify-center gap-1.5 bg-emerald-700 px-3 text-xs font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-60"
                              >
                                {isSaving ? <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : <Check aria-hidden="true" className="h-3.5 w-3.5" />}
                                Accept Application
                              </button>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => void updateApplicationStatus(application.id, "DECLINED")}
                                className="inline-flex min-h-9 items-center justify-center gap-1.5 border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-wait disabled:opacity-60"
                              >
                                <X aria-hidden="true" className="h-3.5 w-3.5" />
                                Decline
                              </button>
                            </div>
                          ) : null}
                        </div>
                        {applicationErrors[application.id] ? (
                          <p role="alert" className="mt-2 text-xs text-rose-700">{applicationErrors[application.id]}</p>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}