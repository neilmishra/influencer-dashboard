"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";

interface FooterProps {
  user: { name?: string | null; email?: string | null; role?: Role | null } | null;
}

const publicLinks = [
  { label: "Explore Campaigns", href: "/campaigns" },
  { label: "Creator Directory", href: "/creators" },
  { label: "Platform Security", href: "/terms" },
  { label: "Account Settings", href: "/settings" },
];

const brandAndAdminLinks = [
  { label: "Brand Tools", href: "/dashboard/brand" },
  { label: "Campaign Billing", href: "/brand/payments" },
  { label: "Roster Access", href: "/creators" },
];

const creatorLinks = [
  { label: "Creator Suite", href: "/dashboard/creator/marketplace" },
  { label: "Live Escrow Deals", href: "/creator/collaborations" },
  { label: "My Earnings Tracker", href: "/creator/earnings" },
];

const complianceLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Support & Contact", href: "/contact" },
  { label: "Contact Compliance", href: "mailto:legal@xcollab.app" },
];

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 4l7.5 10L4.5 20H7l6-6.2L17 20h3l-7.8-10.5L19.5 4H17l-5.5 5.8L8 4H4Z" />
    </svg>
  );
}

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M15.5 3.5a5.5 5.5 0 0 0 5 5.5V12a8 8 0 0 1-3-.5v5a5.5 5.5 0 1 1-5.5-5.5" />
      <path d="M12 8.5v9" />
      <path d="M9 11.5a3 3 0 1 0 3 3V8.5" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x={3} y={3} width={18} height={18} rx={5} />
      <circle cx={12} cy={12} r={4} />
      <circle cx={17.5} cy={6.5} r={1} fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x={2.5} y={5} width={19} height={14} rx={3.5} />
      <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const socialProfiles = [
  {
    label: "X (Twitter)",
    href: "https://x.com/xcollabapp",
    Icon: XIcon,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@xcollab",
    Icon: TikTokIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/xcollab.app/",
    Icon: InstagramIcon,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@xCollabApp",
    Icon: YouTubeIcon,
  },
];

export function Footer({ user }: FooterProps) {
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  if (pathname?.startsWith("/p/")) return null;

  const role = user?.role ?? null;
  const showBrandSection = role === "BRAND" || role === "ADMIN";
  const showCreatorSection = role === "CREATOR";

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
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.35fr_1fr_1fr_1.4fr] lg:px-8 lg:py-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-slate-950">
            <img src="/logo-transparent.png" alt="xCollab Logo" className="h-8 w-auto" />
            <span className="text-sm font-semibold">xCollab</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            The escrow-powered campaign marketplace for verified creators and performance-driven brands.
            Razorpay-locked budgets, cross-platform identity checks, transparent EMV reporting.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {socialProfiles.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-600 transition hover:border-slate-500 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {showCreatorSection ? (
          <nav aria-label="Creator workspace">
            <h2 className="text-xs font-semibold uppercase text-slate-900">Creator Suite</h2>
            <ul className="mt-4 space-y-2.5">
              {creatorLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="group inline-flex items-center gap-2 text-sm transition hover:text-slate-950">
                    <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-accent transition group-hover:scale-125" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <nav aria-label="Public marketplace">
            <h2 className="text-xs font-semibold uppercase text-slate-900">Marketplace</h2>
            <ul className="mt-4 space-y-2.5">
              {publicLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="group inline-flex items-center gap-2 text-sm transition hover:text-slate-950">
                    <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-accent transition group-hover:scale-125" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {showBrandSection ? (
          <nav aria-label="Brand & admin tools">
            <h2 className="text-xs font-semibold uppercase text-slate-900">Brand Tools</h2>
            <ul className="mt-4 space-y-2.5">
              {brandAndAdminLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="group inline-flex items-center gap-2 text-sm transition hover:text-slate-950">
                    <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-primary transition group-hover:scale-125" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <nav aria-label="Legal & compliance">
            <h2 className="text-xs font-semibold uppercase text-slate-900">Compliance</h2>
            <ul className="mt-4 space-y-2.5">
              {complianceLinks.slice(0, 3).map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="group inline-flex items-center gap-2 text-sm transition hover:text-slate-950">
                    <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-primary transition group-hover:scale-125" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

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
          <div className="flex items-center gap-2">
            <img src="/logo-transparent.png" alt="xCollab Logo" className="h-5 w-auto" />
            <p>
              © 2026 xCollab, Inc. All rights reserved
              <Link
                href="/signup?admin=true"
                aria-label="Admin sign-in"
                title="Admin sign-in"
                className="text-slate-300 transition-colors hover:text-slate-500 focus-visible:rounded-sm focus-visible:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                .
              </Link>
            </p>
          </div>
          <nav aria-label="Legal & compliance" className="flex flex-wrap items-center gap-4">
            {complianceLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-slate-900">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}