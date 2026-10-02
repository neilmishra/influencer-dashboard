import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignPostForm } from "@/components/campaigns/CampaignPostForm";

export default function NewCampaignPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to marketplace
      </Link>

      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
          Brand workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Create a campaign</h1>
        <p className="mt-2 text-sm text-slate-600">
          Set the essentials and publish a concise brief creators can scan quickly.
        </p>
      </header>

      <CampaignPostForm />
    </div>
  );
}