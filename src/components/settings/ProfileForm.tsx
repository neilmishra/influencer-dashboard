"use client";

import { useRef, useState } from "react";
import { Check, Loader2, AlertCircle, Camera } from "lucide-react";

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
  roleLabel: string;
}

type SaveState = "idle" | "saving" | "success" | "error";

export function ProfileForm({
  initialName,
  initialEmail,
  roleLabel,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Avatar preview ────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setAvatarSrc(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  }

  // ── Save handler ──────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSaveState("saving");

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json().catch(() => ({})) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      setSaveState("success");
      // Reset success banner after 3 s
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not save changes.");
      setSaveState("error");
    }
  }

  const isSaving = saveState === "saving";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid max-w-xl gap-0 divide-y divide-slate-100 rounded border border-slate-200 bg-white text-sm">

        {/* ── Avatar ── */}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <span className="font-medium text-slate-700">Photo</span>
          <div className="flex items-center gap-3">
            {/* Preview — shows uploaded image or gradient placeholder */}
            <div className="relative h-10 w-10 flex-shrink-0">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt="Avatar preview"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-200"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600"
                  aria-hidden="true"
                />
              )}
              {/* Camera badge overlay */}
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 ring-2 ring-white"
                aria-hidden="true"
              >
                <Camera className="h-2.5 w-2.5 text-white" />
              </span>
            </div>

            {/* Hidden file input wired to button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              aria-label="Upload profile photo"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              Change photo
            </button>
            {avatarSrc && (
              <span className="text-[11px] text-slate-400">Preview updated</span>
            )}
          </div>
        </div>

        {/* ── Name ── */}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <label htmlFor="settings-name" className="font-medium text-slate-700">
            Full name
          </label>
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            maxLength={120}
            className="h-9 w-56 rounded border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* ── Email ── */}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <label htmlFor="settings-email" className="font-medium text-slate-700">
            Email address
          </label>
          <input
            id="settings-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            maxLength={254}
            className="h-9 w-56 rounded border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* ── Role — read-only ── */}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <span className="font-medium text-slate-700">Role</span>
          <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* ── Feedback banners ── */}
      {saveState === "success" && (
        <div
          role="status"
          className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800"
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          Profile saved successfully.
        </div>
      )}
      {saveState === "error" && errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {errorMsg}
        </div>
      )}

      {/* ── Save button ── */}
      <button
        type="submit"
        disabled={isSaving}
        aria-busy={isSaving}
        className="inline-flex items-center gap-2 rounded border border-slate-300 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSaving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
