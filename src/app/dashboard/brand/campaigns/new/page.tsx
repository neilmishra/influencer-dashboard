import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignCreationForm } from "@/components/campaigns/CampaignCreationForm";
import { requireDashboardRole } from "@/lib/require-dashboard-role";

export default async function BrandCampaignCreationPage() {
  await requireDashboardRole("BRAND");

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <Link
        href="/dashboard/brand"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Brand dashboard
      </Link>
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">Brand workspace</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Create a campaign</h1>
        <p className="mt-2 text-sm text-slate-600">
          Share a concise brief and invite creators to apply.
        </p>
      </header>
      <CampaignCreationForm />
    </section>
  );
}