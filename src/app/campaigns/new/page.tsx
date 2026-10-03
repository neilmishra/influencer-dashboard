import { redirect } from "next/navigation";
import { requireDashboardRole } from "@/lib/require-dashboard-role";

export default async function NewCampaignPage() {
  await requireDashboardRole("BRAND");
  redirect("/dashboard/brand/campaigns/new");
}