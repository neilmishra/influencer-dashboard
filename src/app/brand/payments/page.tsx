import { DashboardPlaceholder } from "@/components/layout/DashboardPlaceholder";
import { requireDashboardRole } from "@/lib/require-dashboard-role";

export default async function BrandPaymentsPage() {
  await requireDashboardRole("BRAND");

  return (
    <DashboardPlaceholder
      title="Invoices / Payments"
      description="Review campaign invoices, payment status, and billing history."
    />
  );
}