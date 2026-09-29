"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, X } from "lucide-react";

interface CreatorForm {
  name: string;
  handle: string;
  category: string;
  followers: string;
}

const initialForm: CreatorForm = {
  name: "",
  handle: "",
  category: "",
  followers: "",
};

export function AddCreatorModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CreatorForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSubmitting]);

  function closeModal() {
    if (isSubmitting) return;
    setIsOpen(false);
    setError(null);
  }

  function updateField(field: keyof CreatorForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const name = form.name.trim();
    const handle = form.handle.trim().replace(/^@+/, "");
    const category = form.category.trim();
    const followers = Number(form.followers);

    if (!name || !handle || !category || !Number.isSafeInteger(followers) || followers < 0) {
      setError("Enter a name, handle, category, and valid follower count.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          handle: `@${handle}`,
          category,
          followers,
          avatar: `https://i.pravatar.cc/240?u=${encodeURIComponent(handle)}`,
          engagementRate: 0,
        }),
      });

      if (!response.ok) {
        let message = "Unable to add creator. Please try again.";
        try {
          const result: unknown = await response.json();
          if (
            typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
          ) {
            message = result.error;
          }
        } catch {
          // Keep the default message when the API response has no JSON body.
        }
        setError(message);
        return;
      }

      setForm(initialForm);
      setIsOpen(false);
      router.refresh();
    } catch {
      setError("Could not reach the creator API. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
        Add New Creator
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-creator-title"
            className="my-auto w-full max-w-lg border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">
                  Roster management
                </p>
                <h2 id="add-creator-title" className="mt-2 text-xl font-semibold text-white">
                  Add New Creator
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Add a creator profile to your network.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label="Close dialog"
                className="p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block space-y-1.5 text-sm font-medium text-slate-200">
                Name
                <input
                  autoFocus
                  required
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  autoComplete="name"
                  className="h-11 w-full border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Taylor Morgan"
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-200">
                Handle
                <input
                  required
                  value={form.handle}
                  onChange={(event) => updateField("handle", event.target.value)}
                  autoComplete="off"
                  className="h-11 w-full border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="@taylormorgan"
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-200">
                Category
                <input
                  required
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  className="h-11 w-full border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Fashion, beauty, food..."
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-200">
                Followers
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.followers}
                  onChange={(event) => updateField("followers", event.target.value)}
                  className="h-11 w-full border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="125000"
                />
              </label>

              {error ? (
                <p role="alert" className="border border-rose-900 bg-rose-950/60 px-3 py-2 text-sm text-rose-200">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="h-10 border border-slate-700 px-4 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-10 items-center justify-center gap-2 bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                      Adding creator...
                    </>
                  ) : (
                    "Add creator"
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}