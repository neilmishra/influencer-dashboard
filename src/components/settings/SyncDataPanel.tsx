"use client";

import { useActionState } from "react";
import { Check, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";
import { syncCreatorPlatformsAction } from "@/app/settings/actions";
import { initialSyncActionState } from "@/components/settings/syncTypes";

export function SyncDataPanel() {
  const [state, formAction, isPending] = useActionState(
    syncCreatorPlatformsAction,
    initialSyncActionState,
  );
  const syncedCount = state.outcomes.filter((outcome) => outcome.status === "synced").length;

  return (
    <section className="space-y-4 border-y border-slate-200 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Platform data sync</h2>
          <p className="mt-1 text-sm text-slate-600">
            Refresh audience metrics and recent media from your connected accounts.
          </p>
        </div>
        <form action={formAction}>
          <button
            type="submit"
            name="sync"
            value="1"
            disabled={isPending}
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-wait disabled:opacity-60"
          >
            {isPending
              ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              : <RefreshCw aria-hidden="true" className="h-4 w-4" />}
            {isPending ? "Syncing..." : "Sync connected accounts"}
          </button>
        </form>
      </div>

      {state.error ? (
        <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{state.error}</p>
      ) : null}

      {state.outcomes.length > 0 ? (
        <div aria-live="polite" className="space-y-2">
          {syncedCount > 0 ? (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
              <Check aria-hidden="true" className="h-4 w-4" />
              Synced {syncedCount} platform{syncedCount === 1 ? "" : "s"} successfully.
            </p>
          ) : null}
          <ul className="grid gap-2 md:grid-cols-3">
            {state.outcomes.map((outcome) => (
              <li
                key={outcome.platform}
                className={`border px-3 py-2 text-xs ${outcome.status === "synced" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  {outcome.status === "synced"
                    ? <Check aria-hidden="true" className="h-3.5 w-3.5" />
                    : <TriangleAlert aria-hidden="true" className="h-3.5 w-3.5" />}
                  {outcome.platform}
                </span>
                <span className="mt-1 block leading-5">
                  {outcome.status === "synced"
                    ? `${outcome.posts} recent item${outcome.posts === 1 ? "" : "s"} refreshed.`
                    : outcome.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}