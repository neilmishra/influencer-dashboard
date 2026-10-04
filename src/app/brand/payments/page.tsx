import { BrandPaymentsDashboard } from "@/components/dashboard/BrandPaymentsDashboard";
import { prisma } from "@/lib/prisma";
import { requireDashboardRole } from "@/lib/require-dashboard-role";

async function fetchBrandLedger(userId: string) {
  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      companyName: true,
      totalBudget: true,
      status: true,
      razorpayOrderId: true,
      createdAt: true,
      _count: {
        select: { applications: true },
      },
    },
  });

  let totalSpent = 0;
  let inEscrow = 0;
  let pendingPayment = 0;
  let refunded = 0;

  const ledger = campaigns.map((campaign) => {
    const amount = Number(campaign.totalBudget);
    switch (campaign.status) {
      case "COMPLETED":
        totalSpent += amount;
        break;
      case "ESCROW_LOCKED":
      case "SUBMITTED":
        inEscrow += amount;
        break;
      case "PENDING_PAYMENT":
        pendingPayment += amount;
        break;
      case "REFUNDED":
        refunded += amount;
        break;
    }

    return {
      id: campaign.id,
      razorpayOrderId: campaign.razorpayOrderId,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      companyName: campaign.companyName,
      amount,
      createdAt: campaign.createdAt.toISOString(),
      status: campaign.status,
      applicantCount: campaign._count.applications,
    };
  });

  return {
    totalSpent,
    inEscrow,
    pendingPayment,
    refunded,
    totalInvoices: campaigns.length,
    ledger,
  };
}

export default async function BrandPaymentsPage() {
  const session = await requireDashboardRole("BRAND");
  const summary = await fetchBrandLedger(session.user.id);

  return <BrandPaymentsDashboard summary={summary} />;
}