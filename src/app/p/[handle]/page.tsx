import { notFound } from "next/navigation";
import { ArrowUpRight, BadgeCheck, Camera, Mail, Music2, Play } from "lucide-react";
import { prisma } from "@/lib/prisma";

const providerByPlatform = {
  youtube: "google",
  instagram: "facebook",
  tiktok: "tiktok",
} as const;

function formatCount(value: number | null, suffix?: string) {
  if (value === null) return "Not provided";
  const count = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return suffix ? `${count} ${suffix}` : count;
}

interface PortfolioPageProps {
  params: Promise<{ handle: string }>;
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle).replace(/^@/, "");
  if (!/^[a-zA-Z0-9._-]{1,32}$/.test(handle)) notFound();

  const profile = await prisma.creatorProfile.findFirst({
    where: { handle: { in: [handle, `@${handle}`] } },
    select: {
      handle: true,
      category: true,
      bioSummary: true,
      publicContactEmail: true,
      followers: true,
      engagementRate: true,
      youtubeFollowers: true,
      youtubeAverageViews: true,
      instagramFollowers: true,
      instagramAverageEngagementRate: true,
      tiktokFollowers: true,
      tiktokAverageLikes: true,
      user: {
        select: {
          name: true,
          accounts: {
            where: { provider: { in: ["google", "facebook", "tiktok"] } },
            select: { provider: true, access_token: true, refresh_token: true },
          },
        },
      },
    },
  });
  if (!profile) notFound();

  const platforms = [
    {
      id: "youtube",
      name: "YouTube",
      Icon: Play,
      accent: "text-rose-600",
      metrics: [
        { label: "Followers", value: formatCount(profile.youtubeFollowers) },
        { label: "Average video views", value: formatCount(profile.youtubeAverageViews, "views") },
      ],
      hasManualData: profile.youtubeFollowers !== null || profile.youtubeAverageViews !== null,
    },
    {
      id: "instagram",
      name: "Instagram",
      Icon: Camera,
      accent: "text-fuchsia-700",
      metrics: [
        { label: "Followers", value: formatCount(profile.instagramFollowers) },
        {
          label: "Average engagement rate",
          value: profile.instagramAverageEngagementRate === null
            ? "Not provided"
            : `${profile.instagramAverageEngagementRate.toFixed(2)}%`,
        },
      ],
      hasManualData:
        profile.instagramFollowers !== null || profile.instagramAverageEngagementRate !== null,
    },
    {
      id: "tiktok",
      name: "TikTok",
      Icon: Music2,
      accent: "text-slate-950",
      metrics: [
        { label: "Followers", value: formatCount(profile.tiktokFollowers) },
        { label: "Average likes", value: formatCount(profile.tiktokAverageLikes, "likes") },
      ],
      hasManualData: profile.tiktokFollowers !== null || profile.tiktokAverageLikes !== null,
    },
  ] as const;

  const connectedProviders = new Set(
    profile.user.accounts
      .filter((account) => account.access_token || account.refresh_token)
      .map((account) => account.provider),
  );
  const displayName = profile.user.name?.trim() || profile.handle;
  const contactHref = profile.publicContactEmail
    ? `mailto:${profile.publicContactEmail}?subject=${encodeURIComponent(`Media kit request for ${profile.handle}`)}`
    : null;

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="relative overflow-hidden border border-slate-200 bg-white px-6 py-8 sm:px-10 sm:py-12">
          <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(135deg,transparent_25%,rgba(124,58,237,0.08)_25%,rgba(124,58,237,0.08)_50%,transparent_50%,transparent_75%,rgba(14,165,233,0.08)_75%)] bg-[length:36px_36px] lg:block" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-1.5 border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">
              <BadgeCheck aria-hidden="true" className="h-4 w-4" />
              Influencer Portfolio
            </div>
            <p className="mt-6 text-sm font-medium text-slate-500">{profile.category}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              {displayName}
            </h1>
            <p className="mt-2 text-base text-slate-500">{profile.handle}</p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700">
              {profile.bioSummary || "Creator profile and platform metrics."}
            </p>
          </div>
        </header>

        <section aria-labelledby="metrics-heading" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Audience & performance</p>
              <h2 id="metrics-heading" className="mt-1 text-xl font-semibold">Platform metrics</h2>
            </div>
            <p className="text-xs text-slate-500">Values are shown with their source status.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {platforms.map(({ id, name, Icon, accent, metrics, hasManualData }) => {
              const isVerified = connectedProviders.has(providerByPlatform[id]);
              const status = isVerified
                ? { label: "Verified Data", style: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: "✓" }
                : hasManualData
                  ? { label: "Self-Reported", style: "border-slate-200 bg-slate-100 text-slate-700", icon: "○" }
                  : { label: "No data yet", style: "border-slate-200 bg-white text-slate-500", icon: "–" };

              return (
                <article key={id} className="border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50 ${accent}`}>
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <h3 className="text-base font-semibold">{name}</h3>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] font-medium ${status.style}`}>
                      <span aria-hidden="true">{status.icon}</span>
                      {status.label}
                    </span>
                  </div>
                  <dl className="mt-6 divide-y divide-slate-100">
                    {metrics.map((metric) => (
                      <div key={metric.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <dt className="text-sm text-slate-600">{metric.label}</dt>
                        <dd className="text-right text-sm font-semibold tabular-nums text-slate-950">{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="flex flex-col gap-5 border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="text-lg font-semibold">Interested in working together?</h2>
            <p className="mt-1 text-sm text-slate-600">Request a media kit or discuss a campaign with {displayName}.</p>
          </div>
          {contactHref ? (
            <a
              href={contactHref}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              Contact Creator / Request Media Kit
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          ) : (
            <span className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-slate-200 px-5 text-sm font-medium text-slate-500">
              Contact details unavailable
            </span>
          )}
        </footer>
      </div>
    </main>
  );
}