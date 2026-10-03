import { notFound } from "next/navigation";
import { DashboardPlaceholder } from "@/components/layout/DashboardPlaceholder";
import { requireDashboardRole } from "@/lib/require-dashboard-role";

const creatorSections = {
  applications: {
    title: "My Applications",
    description: "Track the campaigns you have applied to and their review status.",
  },
  collaborations: {
    title: "Active Collaborations",
    description: "Manage active campaign partnerships and upcoming deliverables.",
  },
  earnings: {
    title: "Earnings",
    description: "Review creator payments and campaign earnings in one place.",
  },
} as const;

interface CreatorSectionPageProps {
  params: Promise<{ section: string }>;
}

export default async function CreatorSectionPage({ params }: CreatorSectionPageProps) {
  await requireDashboardRole("CREATOR");
  const { section } = await params;
  const page = creatorSections[section as keyof typeof creatorSections];
  if (!page) notFound();

  return <DashboardPlaceholder {...page} />;
}