"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, BadgeCheck } from "lucide-react";
import type { Creator } from "@/types/dashboard";
import { useDashboard } from "@/context/DashboardContext";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export function CreatorCard({ creator }: { creator: Creator }) {
  const { getCreatorStats, audienceFor } = useDashboard();
  const stats = getCreatorStats(creator);
  const audience = audienceFor(creator);

  return (
    <Link
      href={`/creators/${creator.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-24 bg-slate-200">
        <Image
          src={creator.cover}
          alt=""
          fill
          className="object-cover"
          sizes="400px"
        />
      </div>
      <div className="px-5 pb-5">
        <div className="-mt-8 mb-3 flex items-end justify-between">
          <Image
            src={creator.avatar}
            alt={creator.name}
            width={64}
            height={64}
            className="rounded-2xl border-4 border-white object-cover"
          />
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {formatNumber(audience, { compact: true })} audience
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-violet-700">
            {creator.name}
          </h3>
          {creator.verified ? (
            <BadgeCheck className="h-4 w-4 text-violet-600" />
          ) : null}
        </div>
        <p className="text-sm text-slate-500">{creator.handle}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <MapPin className="h-3 w-3" />
          {creator.location}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {creator.niches.map((niche) => (
            <span
              key={niche}
              className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {niche}
            </span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">EMV</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatCurrency(stats.emv, { compact: true })}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">ROI</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatPercent(stats.roi)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">ER</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatPercent(stats.engagementRate)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
