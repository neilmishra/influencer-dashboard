"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

/** Which section of the security panel is currently open. */
type ActiveSection = "idle" | "password" | "2fa";

type CodeState = "idle" | "sending" | "sent" | "error";
type SaveState = "idle" | "saving" | "success" | "error";

// ── Helper ───────────────────────────────────────────────────────────────────

function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  disabled: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          className="h-9 w-full rounded border border-slate-300 bg-slate-50 px-3 pr-9 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

// ── Inline password-change form ──────────────────────────────────────────────

function PasswordChangeForm({ onClose }: { onClose: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [codeState, setCodeState] = useState<CodeState>("idle");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const otpInputRef = useRef<HTMLInputElement>(null);

  const isSendingCode = codeState === "sending";
  const isSaving = saveState === "saving";
  const isLocked = isSendingCode || isSaving;

  // ── Request OTP ────────────────────────────────────────────────────────────
  async function handleRequestCode() {
    setErrorMsg(null);
    setCodeState("sending");
    try {
      const res = await fetch("/api/auth/reset-password-request", {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setCodeState("sent");
      // Focus the code input after dispatch so the user can type immediately.
      setTimeout(() => otpInputRef.current?.focus(), 50);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not send code.");
      setCodeState("error");
    }
  }

  // ── Submit new password ────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!/^\d{6}$/.test(otpCode)) {
      setErrorMsg("Enter the 6-digit code sent to your email.");
      return;
    }

    setSaveState("saving");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpCode, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setSaveState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not update password.");
      setSaveState("error");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (saveState === "success") {
    return (
      <div className="space-y-4 px-5 py-5">
        <div
          role="status"
          className="flex items-center gap-2.5 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          Password updated successfully. You can close this panel.
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-violet-600 hover:underline"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 border-t border-slate-100 bg-slate-50/60 px-5 py-5"
    >
      {/* ── Password fields ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <PasswordInput
          id="security-new-password"
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          disabled={isLocked}
        />
        <PasswordInput
          id="security-confirm-password"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          disabled={isLocked}
        />
      </div>

      {/* ── Verification code row ── */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 space-y-1.5" style={{ minWidth: "9rem" }}>
          <label
            htmlFor="security-otp"
            className="block text-xs font-medium text-slate-600"
          >
            Verification code
          </label>
          <input
            ref={otpInputRef}
            id="security-otp"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="— — — — — —"
            value={otpCode}
            onChange={(e) =>
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            disabled={isLocked}
            className="h-9 w-full rounded border border-slate-300 bg-slate-50 px-3 text-sm font-mono tracking-[0.25em] text-slate-900 outline-none placeholder:tracking-normal placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Request-code button — lives beside the OTP input */}
        <button
          type="button"
          onClick={handleRequestCode}
          disabled={isLocked || codeState === "sent"}
          aria-busy={isSendingCode}
          className="inline-flex h-9 items-center gap-1.5 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 whitespace-nowrap transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSendingCode && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          )}
          {isSendingCode
            ? "Sending…"
            : codeState === "sent"
            ? "Code sent ✓"
            : "Request code"}
        </button>
      </div>

      {/* Code-sent hint */}
      {codeState === "sent" && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700">
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          A 6-digit code was sent to your account email. Check your inbox.
        </p>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isLocked}
          aria-busy={isSaving}
          className="inline-flex items-center gap-2 rounded bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {isSaving ? "Updating…" : "Update password"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isLocked}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <KeyRound className="h-3 w-3" aria-hidden="true" />
        The code expires after 15 minutes and can only be used once.
      </p>
    </form>
  );
}

// ── SecurityPanel ────────────────────────────────────────────────────────────

export function SecurityPanel() {
  const [active, setActive] = useState<ActiveSection>("idle");

  return (
    <div className="max-w-xl overflow-hidden rounded border border-slate-200 bg-white text-sm">

      {/* ── Password row ── */}
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="font-medium text-slate-700">Password</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Change your account password using a one-time verification code.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={active === "password"}
          aria-controls="security-password-panel"
          onClick={() =>
            setActive((prev) => (prev === "password" ? "idle" : "password"))
          }
          className="inline-flex items-center gap-1.5 rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          {active === "password" ? "Cancel" : "Change password"}
          <ChevronDown
            aria-hidden="true"
            className={[
              "h-3.5 w-3.5 transition-transform duration-200",
              active === "password" ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      </div>

      {/* Inline password-change form — animated expand/collapse */}
      <div
        id="security-password-panel"
        role="region"
        aria-label="Change password"
        className={[
          "grid transition-all duration-300 ease-in-out",
          active === "password"
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <PasswordChangeForm onClose={() => setActive("idle")} />
        </div>
      </div>

      {/* ── 2FA stub ── */}
      <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-4">
        <div>
          <p className="font-medium text-slate-700">Two-factor authentication</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Add a second layer of security to your account.
          </p>
        </div>
        {/* Stub — replace with a full 2FA flow when the authenticator
            integration is ready. The toggle is intentionally inert here. */}
        <button
          type="button"
          role="switch"
          aria-checked="false"
          aria-label="Enable two-factor authentication"
          className="relative h-6 w-11 flex-shrink-0 rounded-full bg-slate-200 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
        </button>
      </div>
    </div>
  );
}
