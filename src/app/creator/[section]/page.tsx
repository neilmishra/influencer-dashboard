import { notFound } from "next/navigation";
import { CreatorDashboard, type CreatorSection } from "@/components/dashboard/CreatorDashboard";
import { prisma } from "@/lib/prisma";
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

type ValidSection = keyof typeof creatorSections;

function normalizeApplicationStatus(raw: string): "PENDING" | "ACCEPTED" | "DECLINED" {
  if (raw === "ACCEPTED" || raw === "DECLINED") return raw;
  return "PENDING";
}

async function fetchApplications(userId: string) {
  const rows = await prisma.campaignApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      campaign: {
        select: {
          id: true,
          title: true,
          companyName: true,
          niche: true,
          platforms: true,
          budgetRange: true,
          totalBudget: true,
          location: true,
          deadline: true,
          status: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    status: normalizeApplicationStatus(row.status),
    createdAt: row.createdAt.toISOString(),
    campaign: {
      ...row.campaign,
      totalBudget: row.campaign.totalBudget.toString(),
      deadline: row.campaign.deadline ? row.campaign.deadline.toISOString() : null,
      status: row.campaign.status,
    },
  }));
}

async function fetchCollaborations(userId: string) {
  const activeCampaignStatuses = ["ESCROW_LOCKED", "SUBMITTED", "COMPLETED"] as const;
  const rows = await prisma.campaignApplication.findMany({
    where: {
      userId,
      status: "ACCEPTED",
      campaign: { status: { in: [...activeCampaignStatuses] } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      submissions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          postUrl: true,
          createdAt: true,
        },
      },
      campaign: {
        select: {
          id: true,
          title: true,
          companyName: true,
          niche: true,
          platforms: true,
          budgetRange: true,
          totalBudget: true,
          location: true,
          deadline: true,
          deliverables: true,
          status: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    submissions: row.submissions.map((submission) => ({
      id: submission.id,
      postUrl: submission.postUrl,
      createdAt: submission.createdAt.toISOString(),
    })),
    campaign: {
      ...row.campaign,
      totalBudget: row.campaign.totalBudget.toString(),
      deadline: row.campaign.deadline ? row.campaign.deadline.toISOString() : null,
      status: row.campaign.status,
    },
  }));
}

async function fetchEarnings(userId: string) {
  const rows = await prisma.campaignApplication.findMany({
    where: {
      userId,
      status: "ACCEPTED",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      campaign: {
        select: {
          id: true,
          title: true,
          companyName: true,
          totalBudget: true,
          status: true,
        },
      },
    },
  });

  let totalEarned = 0;
  let pendingPayout = 0;
  let inEscrow = 0;
  let completedCollaborations = 0;
  let activeCollaborations = 0;

  const history = rows.map((row) => {
    const budget = Number(row.campaign.totalBudget);
    const campaignStatus = row.campaign.status;

    let payoutStatus: "PAID" | "PENDING" | "IN_ESCROW";
    let completedAt: string | null = null;

    if (campaignStatus === "COMPLETED") {
      payoutStatus = "PAID";
      totalEarned += budget;
      completedCollaborations += 1;
      completedAt = row.createdAt.toISOString();
    } else if (campaignStatus === "SUBMITTED") {
      payoutStatus = "PENDING";
      pendingPayout += budget;
      activeCollaborations += 1;
    } else if (campaignStatus === "ESCROW_LOCKED") {
      payoutStatus = "IN_ESCROW";
      inEscrow += budget;
      activeCollaborations += 1;
    } else {
      payoutStatus = "PENDING";
    }

    return {
      id: row.id,
      campaignTitle: row.campaign.title,
      companyName: row.campaign.companyName,
      amount: budget,
      status: payoutStatus,
      completedAt,
    };
  });

  return {
    totalEarned,
    pendingPayout,
    inEscrow,
    completedCollaborations,
    activeCollaborations,
    history,
  };
}

interface CreatorSectionPageProps {
  params: Promise<{ section: string }>;
}

export default async function CreatorSectionPage({ params }: CreatorSectionPageProps) {
  const session = await requireDashboardRole("CREATOR");
  const { section } = await params;
  const page = creatorSections[section as ValidSection];
  if (!page) notFound();

  const validSection = section as CreatorSection;

  const applications = validSection === "applications" ? await fetchApplications(session.user.id) : undefined;
  const collaborations = validSection === "collaborations" ? await fetchCollaborations(session.user.id) : undefined;
  const earnings = validSection === "earnings" ? await fetchEarnings(session.user.id) : undefined;

  return (
    <CreatorDashboard
      section={validSection}
      title={page.title}
      description={page.description}
      applications={applications}
      collaborations={collaborations}
      earnings={earnings}
    />
  );
}