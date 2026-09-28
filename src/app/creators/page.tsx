"use client";

import { CreatorCard } from "@/components/creator/CreatorCard";
import { useDashboard } from "@/context/DashboardContext";

export default function CreatorsPage() {
  const { filteredCreators, search, channel } = useDashboard();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
          Roster directory
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Creators</h1>
        <p className="mt-1 text-sm text-slate-500">
          {filteredCreators.length} creator{filteredCreators.length === 1 ? "" : "s"} matching
          {search ? ` “${search}”` : " the current search"}
          {channel === "all" ? "" : ` on ${channel}`}.
        </p>
      </div>
      {filteredCreators.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          No creators match those filters. Clear search or switch channels.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
}
