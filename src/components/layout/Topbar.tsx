"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import type { UserRole } from "@/generated/prisma/enums";

interface TopbarProps {
  user: { name?: string | null; email?: string | null; role: UserRole } | null;
  onOpenSidebar: () => void;
}

export function Topbar({ user, onOpenSidebar }: TopbarProps) {
  const { search, setSearch } = useDashboard();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isProfileOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        profileButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  const displayName = user?.name?.trim() || user?.email || "Account";
  const displayDetail = user?.role
    ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
    : user?.email ?? "Signed in";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          aria-label="Open dashboard navigation"
          aria-controls="mobile-dashboard-sidebar"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          <Menu aria-hidden="true" className="h-4 w-4" />
        </button>
        <Link href="/" className="text-sm font-semibold text-slate-900">
          xCollab
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
        {user?.role !== "CREATOR" ? (
          <Link
            href="/creators"
            className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:block"
          >
            Roster
          </Link>
        ) : null}
        <button
          type="button"
          className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
        </button>
        <div ref={profileRef} className="relative">
          <button
            ref={profileButtonRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            aria-label={`Profile menu for ${displayName}`}
            onClick={() => setIsProfileOpen((open) => !open)}
            className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white">
              {avatarInitial || <UserRound aria-hidden="true" className="h-4 w-4" />}
            </span>
            <span className="hidden leading-tight md:block">
              <span className="block max-w-40 truncate text-sm font-medium text-slate-900">
                {displayName}
              </span>
              <span className="block max-w-40 truncate text-xs text-slate-500">
                {displayDetail}
              </span>
            </span>
            <ChevronDown aria-hidden="true" className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>

          {isProfileOpen ? (
            <div
              role="menu"
              aria-label="Account menu"
              className="absolute right-0 top-full z-30 mt-2 w-64 border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10"
            >
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email ?? displayDetail}</p>
              </div>
              <Link
                href="/settings"
                role="menuitem"
                onClick={() => setIsProfileOpen(false)}
                className="flex min-h-10 w-full items-center gap-2 px-3 text-sm text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              >
                <Settings aria-hidden="true" className="h-4 w-4 text-slate-400" />
                Account Settings
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex min-h-10 w-full items-center gap-2 px-3 text-sm text-rose-700 hover:bg-rose-50 focus-visible:bg-rose-50 focus-visible:outline-none"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
