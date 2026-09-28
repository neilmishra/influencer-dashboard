"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import type { Deliverable } from "@/types/dashboard";
import { getInteractions } from "@/lib/calculations";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/utils";
import { calculateEngagementRate } from "@/lib/calculations";

export function ContentFeed({ posts }: { posts: Deliverable[] }) {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        No deliverables in this channel and timeframe.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sorted.map((post) => {
        const interactions = getInteractions(post);
        return (
          <article
            key={post.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="relative h-44 bg-slate-200">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
                sizes="500px"
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                {post.platform} · {post.type}
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-400">{formatDate(post.publishedAt)}</p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900">{post.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.caption}</p>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs text-slate-500">
                <Metric icon={<Eye className="mx-auto h-3.5 w-3.5" />} value={post.views} />
                <Metric icon={<Heart className="mx-auto h-3.5 w-3.5" />} value={post.likes} />
                <Metric icon={<MessageCircle className="mx-auto h-3.5 w-3.5" />} value={post.comments} />
                <Metric icon={<Share2 className="mx-auto h-3.5 w-3.5" />} value={post.shares} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500">
                  ER {formatPercent(calculateEngagementRate(interactions, post.impressions))}
                </span>
                <span className="font-medium text-slate-800">
                  Spend {formatCurrency(post.spend, { compact: true })}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Metric({ icon, value }: { icon: ReactNode; value: number }) {
  return (
    <div>
      {icon}
      <p className="mt-1 font-medium text-slate-800">
        {formatNumber(value, { compact: true })}
      </p>
    </div>
  );
}
