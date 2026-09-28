"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, MapPin } from "lucide-react";
import type { Creator, MetricTotals } from "@/types/dashboard";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export function CreatorHeader({
  creator,
  audience,
  stats,
}: {
  creator: Creator;
  audience: number;
  stats: MetricTotals;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-40 bg-slate-200 sm:h-52">
        <Image src={creator.cover} alt="" fill className="object-cover" sizes="1200px" />
        <Link
          href="/creators"
          className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Roster
        </Link>
      </div>
      <div className="px-5 pb-6 sm:px-8">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Image
              src={creator.avatar}
              alt={creator.name}
              width={88}
              height={88}
              className="rounded-2xl border-4 border-white object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">{creator.name}</h1>
                {creator.verified ? (
                  <BadgeCheck className="h-5 w-5 text-violet-600" />
                ) : null}
              </div>
              <p className="text-sm text-slate-500">{creator.handle}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" />
                {creator.location}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Audience" value={formatNumber(audience, { compact: true })} />
            <Stat label="EMV" value={formatCurrency(stats.emv, { compact: true })} />
            <Stat label="ROI" value={formatPercent(stats.roi)} />
            <Stat label="Engagement" value={formatPercent(stats.engagementRate)} />
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{creator.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {creator.niches.map((niche) => (
            <span
              key={niche}
              className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
            >
              {niche}
            </span>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {(["instagram", "youtube", "tiktok"] as const).map((platform) => {
            const account = creator.platforms[platform];
            return (
              <div key={platform} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {platform}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">{account.handle}</p>
                <p className="text-xs text-slate-500">
                  {formatNumber(account.followers, { compact: true })} followers ·{" "}
                  {formatPercent(account.engagementRate)} ER
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
