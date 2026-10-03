"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, Sparkles } from "lucide-react";
import { dashboardRouteForRole } from "@/lib/auth-routes";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        setError("Invalid email or password.");
        return;
      }

      const session = await getSession();
      if (!session?.user?.role) {
        setError("Unable to load your account. Please try again.");
        return;
      }

      setPassword("");
      router.replace(dashboardRouteForRole(session.user.role));
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "h-11 w-full border border-slate-700 bg-slate-900/80 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300";

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.12),transparent_38%)] bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <section className="w-full max-w-md">
        <Link href="/" className="mb-7 inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
            <Sparkles aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">xCollab</span>
            <span className="mt-0.5 block text-sm text-slate-400">Creator and brand network</span>
          </span>
        </Link>

        <div className="border border-slate-800 bg-slate-950/80 p-5 sm:p-8">
          <header>
            <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-400">Sign in to continue to your dashboard.</p>
          </header>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <label className="block space-y-1.5 text-sm font-medium text-slate-200">
              Email address
              <input
                required
                type="email"
                maxLength={254}
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
                placeholder="you@example.com"
                aria-invalid={Boolean(error && !emailPattern.test(email.trim()))}
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-slate-200">
              Password
              <span className="relative block">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClassName} pr-12`}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                  {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {error ? (
              <p role="alert" className="border border-rose-900 bg-rose-950/50 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Signing in..." : "Log in"}
            </button>
          </form>

          <div className="mt-5 border-t border-slate-800 pt-5 text-center text-sm text-slate-400">
            <p>Don&apos;t have an account?</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/signup?role=CREATOR"
                className="inline-flex min-h-10 flex-1 items-center justify-center border border-slate-700 px-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                Sign up as Creator
              </Link>
              <Link
                href="/signup?role=BRAND"
                className="inline-flex min-h-10 flex-1 items-center justify-center border border-slate-700 px-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                Sign up as Brand
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}