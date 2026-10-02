"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Send } from "lucide-react";
import { CreatableCombobox } from "@/components/forms/CreatableCombobox";
import { categoryOptions } from "@/lib/categories";

const platforms = ["YouTube", "Instagram", "TikTok"] as const;

export function CampaignPostForm() {
  const router = useRouter();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedNiche, setSelectedNiche] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function togglePlatform(platform: string) {
    setSelectedPlatforms((selected) =>
      selected.includes(platform)
        ? selected.filter((item) => item !== platform)
        : [...selected, platform],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      niche: selectedNiche,
      location: String(formData.get("location") ?? "").trim(),
      minFollowers: Number(formData.get("minFollowers")),
      budgetRange: String(formData.get("budgetRange") ?? "").trim(),
      platforms: selectedPlatforms,
    };

    try {
      const response = await fetch("/api/marketplace/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
            ? result.error
            : "Could not post this campaign.";
        setError(message);
        return;
      }
      router.replace("/campaigns");
      router.refresh();
    } catch {
      setError("Could not reach the campaign service. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "mt-1.5 h-11 w-full border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">Platforms</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const selected = selectedPlatforms.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                aria-pressed={selected}
                onClick={() => togglePlatform(platform)}
                className={`inline-flex min-h-10 items-center gap-2 border px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${selected ? "border-violet-700 bg-violet-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"}`}
              >
                {selected ? <Check aria-hidden="true" className="h-4 w-4" /> : null}
                {platform}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="platforms" value={selectedPlatforms.join(",")} />
      </fieldset>

      <CreatableCombobox
        id="campaign-niche"
        label="Niche"
        name="niche"
        value={selectedNiche}
        options={categoryOptions}
        onChange={setSelectedNiche}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Campaign title
          <input name="title" required minLength={3} maxLength={100} className={inputClassName} placeholder="Launch campaign with tech creators" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Location
          <input name="location" required minLength={2} maxLength={100} className={inputClassName} placeholder="Remote / United States" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Minimum followers
          <input name="minFollowers" type="number" required min="0" max="2147483647" step="1" inputMode="numeric" className={inputClassName} placeholder="10000" />
        </label>
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Budget range
          <input name="budgetRange" required minLength={2} maxLength={60} className={inputClassName} placeholder="$2,000–$5,000" />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Small description
        <textarea name="description" required minLength={10} maxLength={280} rows={4} className="mt-1.5 w-full resize-y border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100" placeholder="Share the product, deliverables, and ideal creator in a few concise sentences." />
        <span className="mt-1 block text-right text-xs font-normal text-slate-500">280 characters max</span>
      </label>

      {error ? <p role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting || selectedPlatforms.length === 0 || !selectedNiche}
        className="inline-flex min-h-11 items-center justify-center gap-2 bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Send aria-hidden="true" className="h-4 w-4" />}
        {isSubmitting ? "Posting..." : "Post campaign"}
      </button>
    </form>
  );
}