"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardProvider } from "@/context/DashboardContext";
import { FilterBar } from "@/components/layout/FilterBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { dashboardNavigation } from "@/components/layout/dashboardNavigation";
import type { Role } from "@/generated/prisma/enums";

interface AppShellProps {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role: Role } | null;
}

export function AppShell({ children, user }: Readonly<AppShellProps>) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/p/")
  ) {
    return children;
  }
  if (pathname === "/campaigns" && !user) {
    return <main>{children}</main>;
  }

  if (!user || !dashboardNavigation[user.role]) return children;

  return (
    <DashboardProvider>
      <div className="flex min-h-dvh">
        <Sidebar
          navigation={dashboardNavigation[user.role]}
          user={user}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar user={user} onOpenSidebar={() => setMobileSidebarOpen(true)} />
          <FilterBar />
          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}