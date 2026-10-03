"use client";

import { useActionState } from "react";
import { LoaderCircle, Megaphone } from "lucide-react";
import { createCampaignAction } from "@/app/dashboard/brand/campaigns/new/actions";
import { initialCreateCampaignState } from "@/components/campaigns/campaignTypes";

const platforms = ["Instagram", "YouTube", "TikTok"] as const;

const inputClassName =
  "mt-1.5 h-11 w-full border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

export function CampaignCreationForm() {
  const [state, formAction, isPending] = useActionState(
    createCampaignAction,
    initialCreateCampaignState,
  );

  return (
    <form action={formAction} className="space-y-5 border border-slate-200 bg-white p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Campaign title
          <input
            name="title"
            required
            minLength={3}
            maxLength={100}
            autoComplete="off"
            className={inputClassName}
            placeholder="Summer product launch"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Description
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={280}
            rows={4}
            className="mt-1.5 w-full resize-y border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-950 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            placeholder="Describe the product, campaign goals, and creator fit."
          />
          <span className="mt-1 block text-right text-xs font-normal text-slate-500">280 characters max</span>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Budget (USD)
          <input
            name="budget"
            type="number"
            required
            min="0.01"
            max="9999999999.99"
            step="0.01"
            inputMode="decimal"
            className={inputClassName}
            placeholder="5000.00"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Platform
          <select name="platform" required defaultValue="" className={inputClassName}>
            <option value="" disabled>Select a platform</option>
            {platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Application deadline
          <input name="deadline" type="date" required className={inputClassName} />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            The campaign remains visible through the end of the selected date.
          </span>
        </label>
      </div>

      {state.error ? (
        <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <p className="text-xs text-slate-500">You can edit the campaign after it is created.</p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Megaphone aria-hidden="true" className="h-4 w-4" />}
          {isPending ? "Creating campaign..." : "Create campaign"}
        </button>
      </div>
    </form>
  );
}