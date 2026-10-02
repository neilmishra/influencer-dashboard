"use client";

import { useState, type FormEvent } from "react";
import { Check, LoaderCircle, Save } from "lucide-react";
import { CreatableCombobox } from "@/components/forms/CreatableCombobox";
import { categoryOptions } from "@/lib/categories";

interface ManualMetricValues {
  category: string;
  bioSummary: string;
  publicContactEmail: string;
  youtubeFollowers: number | null;
  youtubeAverageViews: number | null;
  instagramFollowers: number | null;
  instagramAverageEngagementRate: number | null;
  tiktokFollowers: number | null;
  tiktokAverageLikes: number | null;
}

export function ManualMetricForm({ values }: { values: ManualMetricValues }) {
  const [category, setCategory] = useState(values.category);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const numberValue = (name: string) => {
      const value = String(formData.get(name) ?? "").trim();
      return value === "" ? null : Number(value);
    };
    const payload = {
      category,
      bioSummary: String(formData.get("bioSummary") ?? ""),
      publicContactEmail: String(formData.get("publicContactEmail") ?? ""),
      youtubeFollowers: numberValue("youtubeFollowers"),
      youtubeAverageViews: numberValue("youtubeAverageViews"),
      instagramFollowers: numberValue("instagramFollowers"),
      instagramAverageEngagementRate: numberValue("instagramAverageEngagementRate"),
      tiktokFollowers: numberValue("tiktokFollowers"),
      tiktokAverageLikes: numberValue("tiktokAverageLikes"),
    };

    try {
      const response = await fetch("/api/settings/creator-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMessage =
          typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
            ? result.error
            : "Could not save these metrics.";
        setError(errorMessage);
        return;
      }
      setMessage("Manual metrics saved.");
    } catch {
      setError("Could not reach the save service. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const inputClassName =
    "mt-1.5 h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="max-w-xl">
        <CreatableCombobox
          id="creator-category"
          label="Creator category"
          name="category"
          value={category}
          options={categoryOptions}
          onChange={setCategory}
        />
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Profile / Bio Summary
        <textarea
          name="bioSummary"
          rows={4}
          maxLength={2_000}
          defaultValue={values.bioSummary}
          placeholder="A short introduction for brands viewing your portfolio"
          className="mt-1.5 w-full resize-y border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </label>

      <label className="block max-w-xl text-sm font-medium text-slate-700">
        Public contact email
        <input
          name="publicContactEmail"
          type="email"
          maxLength={254}
          autoComplete="email"
          defaultValue={values.publicContactEmail}
          placeholder="Leave blank to keep your email private"
          className="mt-1.5 h-10 w-full border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
        <span className="mt-1 block text-xs font-normal text-slate-500">
          This address is shown to visitors who open your portfolio.
        </span>
      </label>

      <div className="grid gap-4 xl:grid-cols-3">
        <fieldset className="space-y-3 border border-slate-200 bg-white p-4">
          <legend className="px-1 text-sm font-semibold text-slate-900">YouTube</legend>
          <label className="block text-sm text-slate-700">
            Follower count
            <input name="youtubeFollowers" type="number" min="0" step="1" defaultValue={values.youtubeFollowers ?? ""} className={inputClassName} />
          </label>
          <label className="block text-sm text-slate-700">
            Average video views
            <input name="youtubeAverageViews" type="number" min="0" step="1" defaultValue={values.youtubeAverageViews ?? ""} className={inputClassName} />
          </label>
        </fieldset>

        <fieldset className="space-y-3 border border-slate-200 bg-white p-4">
          <legend className="px-1 text-sm font-semibold text-slate-900">Instagram</legend>
          <label className="block text-sm text-slate-700">
            Follower count
            <input name="instagramFollowers" type="number" min="0" step="1" defaultValue={values.instagramFollowers ?? ""} className={inputClassName} />
          </label>
          <label className="block text-sm text-slate-700">
            Average engagement rate (%)
            <input name="instagramAverageEngagementRate" type="number" min="0" max="100" step="0.01" defaultValue={values.instagramAverageEngagementRate ?? ""} className={inputClassName} />
          </label>
        </fieldset>

        <fieldset className="space-y-3 border border-slate-200 bg-white p-4">
          <legend className="px-1 text-sm font-semibold text-slate-900">TikTok</legend>
          <label className="block text-sm text-slate-700">
            Follower count
            <input name="tiktokFollowers" type="number" min="0" step="1" defaultValue={values.tiktokFollowers ?? ""} className={inputClassName} />
          </label>
          <label className="block text-sm text-slate-700">
            Average likes
            <input name="tiktokAverageLikes" type="number" min="0" step="1" defaultValue={values.tiktokAverageLikes ?? ""} className={inputClassName} />
          </label>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Save aria-hidden="true" className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save manual metrics"}
        </button>
        {message ? <p role="status" className="inline-flex items-center gap-1.5 text-sm text-emerald-700"><Check aria-hidden="true" className="h-4 w-4" />{message}</p> : null}
        {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
      </div>
    </form>
  );
}