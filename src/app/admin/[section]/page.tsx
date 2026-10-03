import { notFound } from "next/navigation";
import { DashboardPlaceholder } from "@/components/layout/DashboardPlaceholder";
import { requireDashboardRole } from "@/lib/require-dashboard-role";

const adminSections = {
  users: {
    title: "All Users",
    description: "Review Creator, Brand, and Admin accounts across the platform.",
  },
  campaigns: {
    title: "All Campaigns",
    description: "Monitor campaign listings and marketplace activity across the platform.",
  },
  settings: {
    title: "System Settings",
    description: "Manage platform-wide configuration and operational preferences.",
  },
} as const;

interface AdminSectionPageProps {
  params: Promise<{ section: string }>;
}

export default async function AdminSectionPage({ params }: AdminSectionPageProps) {
  await requireDashboardRole("ADMIN");
  const { section } = await params;
  const page = adminSections[section as keyof typeof adminSections];
  if (!page) notFound();

  return <DashboardPlaceholder {...page} />;
}