"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Check, LoaderCircle, MapPin, Music2, Play, Search, Star, Users, Wallet } from "lucide-react";

export interface MarketplaceCampaign {
  id: string;
  companyName: string;
  title: string;
  description: string;
  niche: string;
  platforms: string[];
  minFollowers: number;
  budgetRange: string;
  location: string;
  isPremium: boolean;
  createdAt: Date;
}

const platforms = ["YouTube", "Instagram", "TikTok"];
const platformIcon = {
  YouTube: Play,
  Instagram: Camera,
  TikTok: Music2,
} as const;

export function MarketplaceBoard({
  campaigns,
  canPost,
  isAuthenticated,
  canApply,
  initiallyAppliedCampaignIds,
}: {
  campaigns: MarketplaceCampaign[];
  canPost: boolean;
  isAuthenticated: boolean;
  canApply: boolean;
  initiallyAppliedCampaignIds: string[];
}) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All niches");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [appliedCampaignIds, setAppliedCampaignIds] = useState(() => new Set(initiallyAppliedCampaignIds));
  const [pendingCampaignIds, setPendingCampaignIds] = useState(() => new Set<string>());
  const [applicationMessages, setApplicationMessages] = useState<Record<string, string>>({});
  const [applicationErrors, setApplicationErrors] = useState<Record<string, string>>({});

  const niches = [...new Set(campaigns.map((campaign) => campaign.niche))].sort((first, second) =>
    first.localeCompare(second),
  );
  const keyword = searchText.trim().toLocaleLowerCase();

  const filteredCampaigns = campaigns.filter((campaign) =>
    (selectedNiche === "All niches" || campaign.niche === selectedNiche) &&
    (selectedPlatforms.length === 0 || selectedPlatforms.some((platform) => campaign.platforms.includes(platform))) &&
    (!keyword || [campaign.companyName, campaign.title, campaign.description, campaign.niche, campaign.location, ...campaign.platforms]
      .some((value) => value.toLocaleLowerCase().includes(keyword))),
  );

  function togglePlatform(platform: string) {
    setSelectedPlatforms((selected) =>
      selected.includes(platform) ? selected.filter((item) => item !== platform) : [...selected, platform],
    );
  }

  async function applyToCampaign(campaignId: string) {
    if (!isAuthenticated) {
      router.push("/signup");
      return;
    }
    if (!canApply || pendingCampaignIds.has(campaignId) || appliedCampaignIds.has(campaignId)) return;

    setPendingCampaignIds((current) => new Set(current).add(campaignId));
    setApplicationMessages((current) => ({ ...current, [campaignId]: "" }));
    setApplicationErrors((current) => ({ ...current, [campaignId]: "" }));
    try {
      const response = await fetch(`/api/campaigns/${encodeURIComponent(campaignId)}/apply`, {
        method: "POST",
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
            ? result.error
            : "Could not submit your application. Try again.";
        setApplicationErrors((current) => ({ ...current, [campaignId]: message }));
        return;
      }

      setAppliedCampaignIds((current) => new Set(current).add(campaignId));
      setApplicationMessages((current) => ({
        ...current,
        [campaignId]: "Application submitted! The brand now has access to your portfolio.",
      }));
    } catch {
      setApplicationErrors((current) => ({ ...current, [campaignId]: "Could not reach the application service. Try again." }));
    } finally {
      setPendingCampaignIds((current) => {
        const next = new Set(current);
        next.delete(campaignId);
        return next;
      });
    }
  }

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">Creator opportunities</p>
            <h1 className="mt-1 text-3xl font-semibold">Campaign marketplace</h1>
            <p className="mt-2 text-sm text-slate-600">Find brand campaigns that fit your audience and platforms.</p>
          </div>
          <Link
            href={canPost ? "/campaigns/new" : "/signup?admin=true"}
            className="inline-flex min-h-10 items-center justify-center border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            {canPost ? "Post a campaign" : "Sign in to post"}
          </Link>
        </header>

        <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside aria-label="Filter campaigns" className="space-y-6 border-b border-slate-200 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
            <label className="block text-sm font-semibold" htmlFor="campaign-search">
              Search
              <span className="relative mt-2 block">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="campaign-search"
                  type="search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Keywords, brand, niche..."
                  className="h-10 w-full border border-slate-200 bg-white pl-9 pr-3 text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </span>
            </label>
            <div>
              <h2 className="text-sm font-semibold">Niche</h2>
              <div className="mt-2 flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
                {["All niches", ...niches].map((niche) => (
                  <button
                    key={niche}
                    type="button"
                    aria-pressed={selectedNiche === niche}
                    onClick={() => setSelectedNiche(niche)}
                    className={`shrink-0 px-2.5 py-2 text-left text-sm transition ${selectedNiche === niche ? "bg-slate-950 font-medium text-white" : "text-slate-600 hover:bg-slate-200"}`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold">Platforms</legend>
              <div className="mt-2 flex flex-wrap gap-2 lg:flex-col">
                {platforms.map((platform) => {
                  const selected = selectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => togglePlatform(platform)}
                      className={`inline-flex min-h-9 items-center gap-2 border px-2.5 text-left text-sm transition ${selected ? "border-violet-700 bg-violet-50 text-violet-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}
                    >
                      {platform === "YouTube" ? <Play aria-hidden="true" className="h-4 w-4" /> : platform === "Instagram" ? <Camera aria-hidden="true" className="h-4 w-4" /> : <Music2 aria-hidden="true" className="h-4 w-4" />}
                      {platform}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </aside>

          <section aria-label="Campaign listings" className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="font-medium text-slate-700">{filteredCampaigns.length} campaign{filteredCampaigns.length === 1 ? "" : "s"}</p>
              <span className="text-xs text-slate-500">Premium placements appear first</span>
            </div>
            {filteredCampaigns.length === 0 ? (
              <div className="border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                <h2 className="text-base font-semibold">No campaigns match these filters</h2>
                <p className="mt-1 text-sm text-slate-500">Adjust your niche or platform selection to see more opportunities.</p>
              </div>
            ) : (
              <div className="grid gap-3 xl:grid-cols-2">
                {filteredCampaigns.map((campaign) => (
                  <article key={campaign.id} className={`relative flex min-h-64 flex-col border bg-white p-5 ${campaign.isPremium ? "border-amber-300 pt-9 ring-1 ring-amber-100" : "border-slate-200"}`}>
                    {campaign.isPremium ? (
                      <span className="absolute left-0 top-0 inline-flex items-center gap-1 border-b border-r border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-900">
                        <Star aria-hidden="true" className="h-3 w-3 fill-current" /> Featured
                      </span>
                    ) : null}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-500">{campaign.companyName}</p>
                        <h2 className="mt-1 text-base font-semibold text-slate-950">{campaign.title}</h2>
                      </div>
                      <span className="shrink-0 border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600">{campaign.niche}</span>
                    </div>

                    <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{campaign.description}</p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {campaign.platforms.map((platform) => {
                        const Icon = platformIcon[platform as keyof typeof platformIcon];
                        if (!Icon) return null;
                        return <span key={platform} title={platform} aria-label={platform} className="inline-flex h-7 w-7 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700"><Icon aria-hidden="true" className="h-4 w-4" /></span>;
                      })}
                    </div>

                    <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-700"><Wallet aria-hidden="true" className="h-4 w-4 text-emerald-700" /><dt className="sr-only">Budget</dt><dd className="font-semibold">{campaign.budgetRange}</dd></div>
                      <div className="flex items-center gap-2 text-slate-600"><Users aria-hidden="true" className="h-4 w-4" /><dt className="sr-only">Minimum followers</dt><dd>{new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(campaign.minFollowers)}+ followers</dd></div>
                      <div className="col-span-2 flex items-center gap-2 text-xs text-slate-500"><MapPin aria-hidden="true" className="h-3.5 w-3.5" />{campaign.location}<span className="ml-auto">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(campaign.createdAt)}</span></div>
                    </dl>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => void applyToCampaign(campaign.id)}
                        disabled={appliedCampaignIds.has(campaign.id) || pendingCampaignIds.has(campaign.id) || (isAuthenticated && !canApply)}
                        className="inline-flex min-h-10 w-full items-center justify-center gap-2 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        {pendingCampaignIds.has(campaign.id) ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : appliedCampaignIds.has(campaign.id) ? <Check aria-hidden="true" className="h-4 w-4" /> : null}
                        {pendingCampaignIds.has(campaign.id)
                          ? "Applying..."
                          : appliedCampaignIds.has(campaign.id)
                            ? "Applied"
                            : isAuthenticated && !canApply
                              ? "Creator account required"
                              : "Apply Now"}
                      </button>
                      {applicationMessages[campaign.id] ? (
                        <p role="status" className="mt-2 text-xs leading-5 text-emerald-700">{applicationMessages[campaign.id]}</p>
                      ) : null}
                      {applicationErrors[campaign.id] ? (
                        <p role="alert" className="mt-2 text-xs leading-5 text-rose-700">{applicationErrors[campaign.id]}</p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}