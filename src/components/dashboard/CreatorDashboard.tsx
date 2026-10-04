"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Handshake,
  Hourglass,
  MapPin,
  Megaphone,
  Search,
  Wallet,
} from "lucide-react";

type ApplicationStatus = "PENDING" | "ACCEPTED" | "DECLINED";
type CampaignStatusName =
  | "PENDING_PAYMENT"
  | "ESCROW_LOCKED"
  | "SUBMITTED"
  | "COMPLETED"
  | "REFUNDED";

interface CreatorApplicationItem {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  campaign: {
    id: string;
    title: string;
    companyName: string;
    niche: string;
    platforms: string[];
    budgetRange: string;
    totalBudget: string;
    location: string;
    deadline: string | null;
    status: CampaignStatusName;
  };
}

interface CreatorCollaborationItem {
  id: string;
  createdAt: string;
  submissions: {
    id: string;
    postUrl: string;
    createdAt: string;
  }[];
  campaign: {
    id: string;
    title: string;
    companyName: string;
    niche: string;
    platforms: string[];
    budgetRange: string;
    totalBudget: string;
    location: string;
    deadline: string | null;
    deliverables: string[];
    status: CampaignStatusName;
  };
}

interface CreatorEarningsSummary {
  totalEarned: number;
  pendingPayout: number;
  inEscrow: number;
  completedCollaborations: number;
  activeCollaborations: number;
  history: CreatorEarningsHistoryItem[];
}

interface CreatorEarningsHistoryItem {
  id: string;
  campaignTitle: string;
  companyName: string;
  amount: number;
  status: "PAID" | "PENDING" | "IN_ESCROW";
  completedAt: string | null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function applicationStatusLabel(status: ApplicationStatus) {
  if (status === "ACCEPTED") return "Accepted";
  if (status === "DECLINED") return "Declined";
  return "Under review";
}

function applicationStatusStyles(status: ApplicationStatus) {
  if (status === "ACCEPTED") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "DECLINED") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function campaignStatusLabel(status: CampaignStatusName) {
  switch (status) {
    case "ESCROW_LOCKED":
      return "In progress";
    case "SUBMITTED":
      return "Awaiting review";
    case "COMPLETED":
      return "Completed";
    case "PENDING_PAYMENT":
      return "Awaiting payment";
    case "REFUNDED":
      return "Refunded";
  }
}

function campaignStatusStyles(status: CampaignStatusName) {
  switch (status) {
    case "ESCROW_LOCKED":
      return "border-indigo-200 bg-indigo-50 text-indigo-800";
    case "SUBMITTED":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "PENDING_PAYMENT":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "REFUNDED":
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function earningsStatusStyles(status: CreatorEarningsHistoryItem["status"]) {
  if (status === "PAID") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "IN_ESCROW") return "border-indigo-200 bg-indigo-50 text-indigo-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function earningsStatusLabel(status: CreatorEarningsHistoryItem["status"]) {
  if (status === "PAID") return "Paid out";
  if (status === "IN_ESCROW") return "In escrow";
  return "Pending";
}

interface ApplicationsViewProps {
  applications: CreatorApplicationItem[];
}

function ApplicationsView({ applications }: ApplicationsViewProps) {
  return (
    <div className="space-y-5">
      {applications.length === 0 ? (
        <section className="border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <FileText aria-hidden="true" className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">No applications yet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Browse the marketplace and apply to campaigns that match your audience.
          </p>
          <Link
            href="/dashboard/creator/marketplace"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900"
          >
            Explore the marketplace <ArrowUpRight aria-hidden="true" className="ml-1 h-4 w-4" />
          </Link>
        </section>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {applications.map((application) => (
            <article
              key={application.id}
              className="flex min-w-0 flex-col border border-slate-200 bg-white p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-violet-700">{application.campaign.companyName}</p>
                  <h3 className="mt-1 truncate text-base font-semibold text-slate-950">
                    {application.campaign.title}
                  </h3>
                </div>
                <span
                  className={`shrink-0 border px-2 py-1 text-[11px] font-semibold ${applicationStatusStyles(application.status)}`}
                >
                  {applicationStatusLabel(application.status)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Megaphone aria-hidden="true" className="h-3.5 w-3.5" />
                  {application.campaign.niche}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                  {application.campaign.location}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {application.campaign.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                  >
                    {platform}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
                <div className="space-y-1 text-xs text-slate-500">
                  <p className="inline-flex items-center gap-1.5">
                    <DollarSign aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{application.campaign.budgetRange}</span>
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                    Applied {formatDate(application.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/campaigns/${encodeURIComponent(application.campaign.id)}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 transition hover:text-violet-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                >
                  View campaign <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

interface CollaborationsViewProps {
  collaborations: CreatorCollaborationItem[];
}

function CollaborationsView({ collaborations }: CollaborationsViewProps) {
  return (
    <div className="space-y-5">
      {collaborations.length === 0 ? (
        <section className="border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Handshake aria-hidden="true" className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">No active collaborations</h2>
          <p className="mt-1 text-sm text-slate-500">
            Accepted campaigns with locked escrow will appear here once a brand approves your application.
          </p>
          <Link
            href="/dashboard/creator/marketplace"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900"
          >
            Browse live campaigns <ArrowUpRight aria-hidden="true" className="ml-1 h-4 w-4" />
          </Link>
        </section>
      ) : (
        <div className="grid gap-4">
          {collaborations.map((collab) => {
            const submissionCount = collab.submissions.length;
            const deliverableCount = collab.campaign.deliverables.length || 1;
            const progress = Math.min(100, Math.round((submissionCount / deliverableCount) * 100));
            return (
              <article
                key={collab.id}
                className="flex min-w-0 flex-col border border-slate-200 bg-white p-4 sm:flex-row sm:items-stretch sm:p-0"
              >
                <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-violet-700">{collab.campaign.companyName}</p>
                      <h3 className="mt-1 truncate text-base font-semibold text-slate-950">
                        {collab.campaign.title}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 border px-2 py-1 text-[11px] font-semibold ${campaignStatusStyles(collab.campaign.status)}`}
                    >
                      {campaignStatusLabel(collab.campaign.status)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Megaphone aria-hidden="true" className="h-3.5 w-3.5" />
                      {collab.campaign.niche}
                    </span>
                    {collab.campaign.deadline ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                        Due {formatDate(collab.campaign.deadline)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {collab.campaign.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>

                  {collab.campaign.deliverables.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-slate-700">Deliverables</p>
                      <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600">
                        {collab.campaign.deliverables.slice(0, 4).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                        {collab.campaign.deliverables.length > 4 ? (
                          <li className="text-slate-500">
                            +{collab.campaign.deliverables.length - 4} more
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col justify-between gap-4 border-t border-slate-200 bg-slate-50 p-4 sm:w-64 sm:border-l sm:border-t-0 sm:p-5">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-xs font-semibold text-slate-600">Budget</p>
                      <p className="text-xs text-slate-500">
                        {submissionCount}/{deliverableCount} submitted
                      </p>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {collab.campaign.budgetRange}
                    </p>
                    <div className="mt-3 h-2 w-full overflow-hidden bg-slate-200">
                      <div
                        className="h-full bg-violet-600"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      {collab.submissions.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                          Latest {formatDate(collab.submissions[0].createdAt)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <Hourglass aria-hidden="true" className="h-3.5 w-3.5" />
                          Awaiting first submission
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/campaigns/${encodeURIComponent(collab.campaign.id)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 transition hover:text-violet-950"
                    >
                      Open <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface EarningsViewProps {
  summary: CreatorEarningsSummary;
}

function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  tone = "default",
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  caption: string;
  tone?: "default" | "success" | "pending" | "escrow";
}) {
  const toneStyles =
    tone === "success"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : tone === "pending"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : tone === "escrow"
          ? "text-indigo-700 bg-indigo-50 border-indigo-200"
          : "text-slate-700 bg-slate-50 border-slate-200";

  return (
    <div className="flex items-start justify-between border border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{caption}</p>
      </div>
      <span className={`inline-flex h-10 w-10 items-center justify-center border ${toneStyles}`}>
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
    </div>
  );
}

function EarningsView({ summary }: EarningsViewProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Total earned"
          value={formatCurrency(summary.totalEarned)}
          caption={`From ${summary.completedCollaborations} completed collaboration${summary.completedCollaborations === 1 ? "" : "s"}`}
          tone="success"
        />
        <StatCard
          icon={DollarSign}
          label="Pending payout"
          value={formatCurrency(summary.pendingPayout)}
          caption="Reviewed work awaiting brand release"
          tone="pending"
        />
        <StatCard
          icon={Hourglass}
          label="In escrow"
          value={formatCurrency(summary.inEscrow)}
          caption="Active deliverables, locked and guaranteed"
          tone="escrow"
        />
        <StatCard
          icon={Handshake}
          label="Active partnerships"
          value={String(summary.activeCollaborations)}
          caption={`Open collaboration${summary.activeCollaborations === 1 ? "" : "s"} in progress`}
        />
      </div>

      <section className="border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Payout history</h2>
            <p className="mt-0.5 text-xs text-slate-500">Every partnership tied to your earnings pipeline.</p>
          </div>
          <Link
            href="/creator/collaborations"
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 transition hover:text-violet-950"
          >
            Manage collaborations <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </header>

        {summary.history.length === 0 ? (
          <div className="border border-dashed border-slate-300 bg-white px-6 py-14 text-center m-4">
            <Search aria-hidden="true" className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No payouts on record yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Completed collaborations will populate this timeline automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {summary.history.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-950">{item.campaignTitle}</p>
                    <span
                      className={`border px-2 py-0.5 text-[10px] font-semibold ${earningsStatusStyles(item.status)}`}
                    >
                      {earningsStatusLabel(item.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.companyName}
                    {item.completedAt ? ` · Completed ${formatDate(item.completedAt)}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-950">{formatCurrency(item.amount)}</p>
                  {item.status === "PAID" ? (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
                      Released
                    </p>
                  ) : item.status === "IN_ESCROW" ? (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700">
                      <Hourglass aria-hidden="true" className="h-3 w-3" />
                      Secured, deliver now
                    </p>
                  ) : (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                      <Clock aria-hidden="true" className="h-3 w-3" />
                      Awaiting approval
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export type CreatorSection = "applications" | "collaborations" | "earnings";

interface CreatorDashboardProps {
  section: CreatorSection;
  title: string;
  description: string;
  applications?: CreatorApplicationItem[];
  collaborations?: CreatorCollaborationItem[];
  earnings?: CreatorEarningsSummary;
}

export function CreatorDashboard({
  section,
  title,
  description,
  applications = [],
  collaborations = [],
  earnings = {
    totalEarned: 0,
    pendingPayout: 0,
    inEscrow: 0,
    completedCollaborations: 0,
    activeCollaborations: 0,
    history: [],
  },
}: CreatorDashboardProps) {
  const SectionIcon =
    section === "applications" ? FileText : section === "collaborations" ? Handshake : Wallet;

  const summaryLabel =
    section === "applications"
      ? `${applications.length} application${applications.length === 1 ? "" : "s"}`
      : section === "collaborations"
        ? `${collaborations.length} active collaboration${collaborations.length === 1 ? "" : "s"}`
        : `${earnings.history.length} payout record${earnings.history.length === 1 ? "" : "s"}`;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
            xCollab workspace
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-950">
            <SectionIcon aria-hidden="true" className="h-6 w-6 text-slate-500" />
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="inline-flex w-fit items-center border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
          {summaryLabel}
        </span>
      </header>

      {section === "applications" ? (
        <ApplicationsView applications={applications} />
      ) : section === "collaborations" ? (
        <CollaborationsView collaborations={collaborations} />
      ) : (
        <EarningsView summary={earnings} />
      )}
    </div>
  );
}
