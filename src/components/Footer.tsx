"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Camera, LoaderCircle, Play, Sparkles, Users } from "lucide-react";
import { usePathname } from "next/navigation";

const creatorLinks = [
  { label: "Explore Campaigns", href: "/campaigns" },
  { label: "Creator Directory", href: "/creators" },
  { label: "Success Stories", href: "/creators" },
  { label: "Developer Connections", href: "/settings" },
];

const brandLinks = [
  { label: "Post a Campaign", href: "/campaigns/new" },
  { label: "Find Influencers", href: "/creators" },
  { label: "Pricing Plans", href: "/campaigns/new" },
  { label: "Enterprise Solutions", href: "/campaigns/new" },
];

export function Footer() {
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  if (pathname?.startsWith("/p/")) return null;

  async function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterError(null);
    setIsSubmitting(true);

    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
            ? result.error
            : "Could not save your subscription. Try again.";
        setNewsletterError(message);
        return;
      }
      setHasSubmitted(true);
    } catch {
      setNewsletterError("Could not reach the subscription service. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-10 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.4fr] lg:px-8 lg:py-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center bg-slate-950 text-cyan-300">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">Influencer Dashboard</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            The ultra-fast campaign marketplace for modern creators and premium brands.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              <Camera aria-hidden="true" className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              <Users aria-hidden="true" className="h-4 w-4" />
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              <Play aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>

        <nav aria-label="For Creators">
          <h2 className="text-xs font-semibold uppercase text-slate-900">For Creators</h2>
          <ul className="mt-4 space-y-2.5">
            {creatorLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="group inline-flex items-center gap-2 text-sm transition hover:text-slate-950">
                  <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-cyan-600 transition group-hover:scale-125" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="For Brands">
          <h2 className="text-xs font-semibold uppercase text-slate-900">For Brands</h2>
          <ul className="mt-4 space-y-2.5">
            {brandLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="group inline-flex items-center gap-2 text-sm transition hover:text-slate-950">
                  <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-violet-500 transition group-hover:scale-125" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="footer-newsletter-heading">
          <h2 id="footer-newsletter-heading" className="text-xs font-semibold uppercase text-slate-900">
            Stay updated on new campaigns
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Get new opportunities and marketplace updates in your inbox.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="mt-4 flex max-w-md">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input
              id="footer-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              disabled={hasSubmitted || isSubmitting}
              className="h-11 min-w-0 flex-1 border border-r-0 border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-inset focus:ring-violet-100 disabled:bg-slate-50"
            />
            <button
              type="submit"
              aria-label="Stay updated on new campaigns"
              title="Stay updated on new campaigns"
              disabled={hasSubmitted || isSubmitting}
              className="flex h-11 w-11 shrink-0 items-center justify-center bg-slate-950 text-white transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-default disabled:bg-emerald-700"
            >
              {isSubmitting ? (
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </form>
          {hasSubmitted ? (
            <p role="status" className="mt-2 text-xs text-emerald-700">You&apos;re on the list.</p>
          ) : null}
          {newsletterError ? (
            <p role="alert" className="mt-2 text-xs text-rose-700">{newsletterError}</p>
          ) : null}
        </section>
      </div>

      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © 2026 Influencer Dashboard. All rights reserved
            <Link
              href="/signup?admin=true"
              aria-label="Admin sign-in"
              title="Admin sign-in"
              className="text-slate-300 transition-colors hover:text-slate-500 focus-visible:rounded-sm focus-visible:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              .
            </Link>
          </p>
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link href="/privacy" className="transition hover:text-slate-900">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-slate-900">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}