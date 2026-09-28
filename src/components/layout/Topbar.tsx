"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

export function Topbar() {
  const { search, setSearch } = useDashboard();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="lg:hidden">
        <Link href="/" className="text-sm font-semibold text-slate-900">
          Pulseboard
        </Link>
      </div>
      <label className="relative flex min-w-0 flex-1 items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search creators, niches, campaigns..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none ring-violet-500 placeholder:text-slate-400 focus:bg-white focus:ring-2"
        />
      </label>
      <div className="flex items-center gap-3">
        <Link
          href="/creators"
          className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:block"
        >
          Roster
        </Link>
        <button
          type="button"
          className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600" />
          <div className="hidden leading-tight md:block">
            <p className="text-sm font-medium text-slate-900">Avery Chen</p>
            <p className="text-xs text-slate-500">Brand partnership lead</p>
          </div>
        </div>
      </div>
    </header>
  );
}
