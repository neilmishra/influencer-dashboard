"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DashboardNavigationItem } from "@/components/layout/dashboardNavigation";
import type { UserRole } from "@/generated/prisma/enums";

interface SidebarProps {
  navigation: DashboardNavigationItem[];
  user: { name?: string | null; email?: string | null; role: UserRole };
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
}

function SidebarContents({
  navigation,
  user,
  onNavigate,
}: {
  navigation: DashboardNavigationItem[];
  user: SidebarProps["user"];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeItem = navigation
    .filter(({ href }) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`))
    .sort((first, second) => second.href.length - first.href.length)[0];
  const displayName = user.name?.trim() || user.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <Link href="/" onClick={onNavigate} className="flex items-center gap-3 px-5 py-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white">
          <Sparkles aria-hidden="true" className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-wide text-white">xCollab</span>
          <span className="block text-xs text-slate-400">Influencer intelligence</span>
        </span>
      </Link>

      <nav aria-label="Dashboard navigation" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {navigation.map((item) => {
          const isActive = activeItem?.href === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex min-w-0 items-center gap-3 px-2 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-sm font-semibold text-slate-950">
            {initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">{displayName}</span>
            {user.email ? <span className="block truncate text-xs text-slate-400">{user.email}</span> : null}
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
              {user.role}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}

export function Sidebar({ navigation, user, mobileOpen, setMobileOpen }: SidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, setMobileOpen]);

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-[#0b1220] text-slate-200 lg:flex">
        <SidebarContents navigation={navigation} user={user} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
          />
          <aside
            id="mobile-dashboard-sidebar"
            aria-label="Dashboard menu"
            className="relative z-10 flex h-dvh w-[min(20rem,86vw)] shrink-0 flex-col bg-[#0b1220] text-slate-200 shadow-2xl"
          >
            <div className="absolute right-3 top-5 z-20">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <SidebarContents
              navigation={navigation}
              user={user}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}