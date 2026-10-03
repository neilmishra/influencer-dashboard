import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Users, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireDashboardRole } from "@/lib/require-dashboard-role";

interface CreatorCampaignDetailProps {
  params: Promise<{ id: string }>;
}

export default async function CreatorCampaignDetailPage({ params }: CreatorCampaignDetailProps) {
  await requireDashboardRole("CREATOR");
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: {
      companyName: true,
      title: true,
      description: true,
      platforms: true,
      minFollowers: true,
      budgetRange: true,
      budget: true,
      deadline: true,
      location: true,
      niche: true,
    },
  });

  if (!campaign || (campaign.deadline && campaign.deadline < new Date())) notFound();

  const budget = campaign.budget.toNumber() > 0
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(campaign.budget.toNumber())
    : campaign.budgetRange;

  return (
    <article className="mx-auto w-full max-w-4xl space-y-6">
      <Link
        href="/dashboard/creator/marketplace"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to marketplace
      </Link>
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">{campaign.companyName}</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">{campaign.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{campaign.niche}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {campaign.platforms.map((platform) => (
            <span key={platform} className="border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
              {platform}
            </span>
          ))}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Campaign details">
        <div className="flex items-center gap-3 border border-slate-200 bg-white p-4">
          <Wallet aria-hidden="true" className="h-4 w-4 text-emerald-700" />
          <div><p className="text-xs text-slate-500">Budget</p><p className="mt-0.5 text-sm font-semibold text-slate-950">{budget}</p></div>
        </div>
        <div className="flex items-center gap-3 border border-slate-200 bg-white p-4">
          <Users aria-hidden="true" className="h-4 w-4 text-violet-700" />
          <div><p className="text-xs text-slate-500">Minimum audience</p><p className="mt-0.5 text-sm font-semibold text-slate-950">{new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(campaign.minFollowers)}+</p></div>
        </div>
        <div className="flex items-center gap-3 border border-slate-200 bg-white p-4">
          <CalendarDays aria-hidden="true" className="h-4 w-4 text-cyan-700" />
          <div><p className="text-xs text-slate-500">Apply by</p><p className="mt-0.5 text-sm font-semibold text-slate-950">{campaign.deadline ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(campaign.deadline) : "Open"}</p></div>
        </div>
      </section>

      <section className="border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="text-sm font-semibold text-slate-900">Campaign brief</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{campaign.description}</p>
        <p className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <MapPin aria-hidden="true" className="h-4 w-4" /> {campaign.location}
        </p>
      </section>
    </article>
  );
}