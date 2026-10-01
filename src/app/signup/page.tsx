"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";

type SignupRole = "CREATOR" | "BRAND";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  handle: string;
  category: string;
  followers: string;
  companyName: string;
  budget: string;
}

const initialForm: SignupForm = {
  name: "",
  email: "",
  password: "",
  handle: "",
  category: "",
  followers: "",
  companyName: "",
  budget: "0",
};

function errorMessage(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }
  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<SignupRole>("CREATOR");
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);

  function updateField(field: keyof SignupForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setAccountCreated(false);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role,
      ...(role === "CREATOR"
        ? {
            handle: form.handle.trim(),
            category: form.category.trim(),
            followers: Number(form.followers),
          }
        : {
            companyName: form.companyName.trim(),
            budget: Number(form.budget),
          }),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        setError(errorMessage(result) ?? "Unable to create your account. Please try again.");
        return;
      }

      setAccountCreated(true);
      const signInResult = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Your account was created, but automatic sign-in failed. You can sign in below.");
        return;
      }

      setForm(initialForm);
      router.replace("/");
      router.refresh();
    } catch {
      setError("Could not reach the signup service. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "h-11 w-full border border-slate-700 bg-slate-900/80 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300";

  return (
    <main className="-mx-4 -my-6 flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.12),transparent_38%)] bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:-mx-8 lg:px-8">
      <section className="w-full max-w-xl">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
            <Sparkles aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Pulseboard
            </p>
            <p className="mt-0.5 text-sm text-slate-400">Creator and brand network</p>
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-950/80 p-5 sm:p-8">
          <header>
            <h1 className="text-2xl font-semibold text-white">Create your account</h1>
            <p className="mt-2 text-sm text-slate-400">
              Set up your profile to join the network.
            </p>
          </header>

          <div className="mt-6 grid grid-cols-2 border border-slate-800 bg-slate-900/70 p-1" role="tablist" aria-label="Account type">
            <button
              id="creator-tab"
              type="button"
              role="tab"
              aria-selected={role === "CREATOR"}
              aria-controls="signup-form"
              onClick={() => setRole("CREATOR")}
              className={`min-h-10 px-3 text-sm font-medium transition ${
                role === "CREATOR"
                  ? "bg-cyan-300 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Are you a Creator?
            </button>
            <button
              id="brand-tab"
              type="button"
              role="tab"
              aria-selected={role === "BRAND"}
              aria-controls="signup-form"
              onClick={() => setRole("BRAND")}
              className={`min-h-10 px-3 text-sm font-medium transition ${
                role === "BRAND"
                  ? "bg-cyan-300 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Are you a Brand?
            </button>
          </div>

          <form id="signup-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-1.5 text-sm font-medium text-slate-200">
              Your name
              <input
                required
                maxLength={100}
                autoComplete="name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={inputClassName}
                placeholder="Alex Morgan"
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-slate-200">
              Email address
              <input
                required
                type="email"
                maxLength={254}
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={inputClassName}
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-slate-200">
              Password
              <input
                required
                type="password"
                minLength={12}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className={inputClassName}
                placeholder="At least 12 characters"
              />
            </label>

            {role === "CREATOR" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm font-medium text-slate-200">
                  Creator handle
                  <input
                    required
                    maxLength={31}
                    autoComplete="username"
                    value={form.handle}
                    onChange={(event) => updateField("handle", event.target.value)}
                    className={inputClassName}
                    placeholder="@yourhandle"
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-medium text-slate-200">
                  Category
                  <input
                    required
                    maxLength={60}
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className={inputClassName}
                    placeholder="Fashion, food..."
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-medium text-slate-200 sm:col-span-2">
                  Followers
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={form.followers}
                    onChange={(event) => updateField("followers", event.target.value)}
                    className={inputClassName}
                    placeholder="25000"
                  />
                </label>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm font-medium text-slate-200 sm:col-span-2">
                  Company name
                  <input
                    required
                    maxLength={120}
                    autoComplete="organization"
                    value={form.companyName}
                    onChange={(event) => updateField("companyName", event.target.value)}
                    className={inputClassName}
                    placeholder="Northstar Studio"
                  />
                </label>
                <label className="block space-y-1.5 text-sm font-medium text-slate-200 sm:col-span-2">
                  Campaign budget
                  <input
                    required
                    type="number"
                    min="0"
                    max="9999999999.99"
                    step="0.01"
                    inputMode="decimal"
                    value={form.budget}
                    onChange={(event) => updateField("budget", event.target.value)}
                    className={inputClassName}
                    placeholder="0.00"
                  />
                </label>
              </div>
            )}

            {error ? (
              <p role="alert" className="border border-rose-900 bg-rose-950/50 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            {accountCreated && error ? (
              <Link
                href="/api/auth/signin"
                className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300 hover:text-cyan-200"
              >
                Continue to sign in <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 border-t border-slate-800 pt-5 text-xs text-slate-500">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-400" />
            Passwords are hashed before they are stored.
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/api/auth/signin" className="font-medium text-cyan-300 hover:text-cyan-200">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}