import {
  CreditCard,
  FileText,
  Handshake,
  LayoutDashboard,
  Megaphone,
  Search,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/generated/prisma/enums";

export interface DashboardNavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const dashboardNavigation: Record<UserRole, DashboardNavigationItem[]> = {
  ADMIN: [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "All Users", icon: Users },
    { href: "/admin/campaigns", label: "All Campaigns", icon: Megaphone },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ],
  BRAND: [
    { href: "/dashboard/brand", label: "Campaign Overview", icon: LayoutDashboard },
    { href: "/dashboard/brand/campaigns/new", label: "Create New Campaign", icon: Megaphone },
    { href: "/creators", label: "Active Influencers", icon: Users },
    { href: "/brand/payments", label: "Invoices / Payments", icon: CreditCard },
  ],
  CREATOR: [
    { href: "/dashboard/creator/marketplace", label: "Marketplace / Browse Campaigns", icon: Search },
    { href: "/creator/applications", label: "My Applications", icon: FileText },
    { href: "/creator/collaborations", label: "Active Collaborations", icon: Handshake },
    { href: "/creator/earnings", label: "Earnings", icon: Wallet },
  ],
};

export const dashboardTitleByRole: Record<UserRole, string> = {
  ADMIN: "Admin Workspace",
  BRAND: "Brand Workspace",
  CREATOR: "Creator Workspace",
};