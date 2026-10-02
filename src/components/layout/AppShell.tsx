"use client";

import { usePathname } from "next/navigation";
import { DashboardProvider } from "@/context/DashboardContext";
import { FilterBar } from "@/components/layout/FilterBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import type { UserRole } from "@/generated/prisma/enums";

interface AppShellProps {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role: UserRole } | null;
}

export function AppShell({ children, user }: Readonly<AppShellProps>) {
  const pathname = usePathname();

  if (pathname === "/signup" || pathname.startsWith("/p/") || pathname === "/campaigns") {
    return children;
  }

  return (
    <DashboardProvider>
      <div className="flex min-h-full">
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar user={user} />
          <FilterBar />
          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}