import type { Metadata } from "next";
import Link from "next/link";
import {
  BookDashed,
  FileCheck,
  LifeBuoy,
  Mail,
  ShieldAlert,
  Sparkles,
  Timer,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Support | xCollab",
  description:
    "xCollab support hub: brand support line, compliance hotline, security disclosure channel, and response SLA for escrow, account, and billing issues.",
};

function ContactCard({
  icon: Icon,
  title,
  summary,
  actionLabel,
  href,
  tone,
  meta,
}: {
  icon: typeof Mail;
  title: string;
  summary: string;
  actionLabel: string;
  href: string;
  tone: "emerald" | "violet" | "rose" | "sky" | "amber";
  meta?: string;
}) {
  const toneMap: Record<typeof tone, string> = {
    emerald:
      "text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-200",
    violet:
      "text-violet-700 bg-violet-50 ring-1 ring-inset ring-violet-200",
    rose: "text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-200",
    sky: "text-sky-700 bg-sky-50 ring-1 ring-inset ring-sky-200",
    amber:
      "text-amber-700 bg-amber-50 ring-1 ring-inset ring-amber-200",
  };

  const isExternal =
    href.startsWith("mailto:") ||
    href.startsWith("http://") ||
    href.startsWith("https://");

  const Outer: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }> = 
    (isExternal ? "a" : Link) as unknown as React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;

  const innerProps = isExternal
    ? ({ href, target: href.startsWith("mailto:") ? undefined : "_blank", rel: "noreferrer" } as const)
    : ({ href } as const);

  return (
    <Outer
      {...innerProps}
      className="group flex h-full flex-col gap-3 border border-slate-200 bg-white p-5 transition hover:border-slate-400"
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center ${toneMap[tone]}`}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          {meta ? (
            <p className="text-[11px] font-medium text-slate-500">{meta}</p>
          ) : null}
        </div>
      </div>
      <p className="text-sm leading-6 text-slate-700">{summary}</p>
      <div className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 transition group-hover:text-violet-900">
        {actionLabel}
        <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </Outer>
  );
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 sm:px-8">
          <img
            src="/logo.png"
            alt="xCollab"
            className="h-6 w-auto"
          />
          <div className="h-5 w-px bg-slate-200" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
            xCollab · Contact & Support Hub
          </p>
        </div>

        <div className="grid gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:py-10">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700">
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-semibold text-slate-950">
                  Get in touch with xCollab
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Pick the channel that matches your issue — our teams split
                  the queue so you get the fastest possible response from
                  the right person. Operational support (24×7 for open
                  escrow), legal, and security response SLAs below.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200 overflow-hidden border border-slate-200 bg-slate-50 text-xs">
              <div className="grid grid-cols-3 px-4 py-2.5 font-semibold uppercase tracking-wide text-slate-600">
                <p>Priority</p>
                <p>Channel</p>
                <p>Response SLA</p>
              </div>
              <div className="grid grid-cols-3 gap-x-2 px-4 py-2.5 text-slate-700">
                <p className="inline-flex items-center gap-1.5">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-rose-600" aria-hidden="true" />
                  Critical · live escrow issues
                </p>
                <p>support@xcollab.app · subject starts with [URGENT]</p>
                <p>1 hour · 24×7</p>
              </div>
              <div className="grid grid-cols-3 gap-x-2 px-4 py-2.5 text-slate-700">
                <p className="inline-flex items-center gap-1.5">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-600" aria-hidden="true" />
                  High · billing / account lock
                </p>
                <p>support@xcollab.app</p>
                <p>Same business day</p>
              </div>
              <div className="grid grid-cols-3 gap-x-2 px-4 py-2.5 text-slate-700">
                <p className="inline-flex items-center gap-1.5">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                  Standard · campaigns / feature
                </p>
                <p>support@xcollab.app or community channels</p>
                <p>1–2 business days</p>
              </div>
              <div className="grid grid-cols-3 gap-x-2 px-4 py-2.5 text-slate-700">
                <p className="inline-flex items-center gap-1.5">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-violet-700" aria-hidden="true" />
                  Legal / compliance
                </p>
                <p>legal@xcollab.app</p>
                <p>3 business days</p>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-3 border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Timer aria-hidden="true" className="h-3.5 w-3.5" />
              Operational hours
            </div>
            <p className="text-sm font-semibold text-slate-950">
              Mon – Fri · 09:00 – 21:00 IST
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Bengaluru, Karnataka, India. Critical escrow incidents are
              on-call globally and acknowledged outside business hours —
              always tag <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">[URGENT]</code>{" "}
              in the subject line if funds are locked.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                All systems operational
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                Escrow queue: 0 overdue
              </span>
            </div>
          </aside>
        </div>

        <div className="grid gap-4 border-t border-slate-200 px-5 py-8 sm:px-8 sm:grid-cols-2 lg:grid-cols-3 lg:py-10">
          <ContactCard
            icon={LifeBuoy}
            tone="emerald"
            title="Brand & Creator Support"
            meta="support@xcollab.app"
            summary="Campaign applications, submissions, escrow lifecycle, marketplace search, profile edits, payout questions, onboarding help. Our support line answers both sides of the marketplace."
            actionLabel="Email support@xcollab.app"
            href="mailto:support@xcollab.app?subject=xCollab%20Support%20Request"
          />

          <ContactCard
            icon={FileCheck}
            tone="violet"
            title="Compliance & Legal"
            meta="legal@xcollab.app"
            summary="Terms of Service questions, DPDP / GDPR subject requests routed via the legal team, takedown notices, campaign-addendum signatures, and B2B paperwork for enterprise brands."
            actionLabel="Email legal@xcollab.app"
            href="mailto:legal@xcollab.app?subject=xCollab%20Legal%20Inquiry"
          />

          <ContactCard
            icon={ShieldAlert}
            tone="rose"
            title="Security Disclosure"
            meta="security@xcollab.app · PGP on request"
            summary="Report a suspected vulnerability, OAuth token leak, escrow bypass, or account-takeover bug. We run a private bounty for qualifying reports affecting escrow or authentication state."
            actionLabel="Disclose to security@xcollab.app"
            href="mailto:security@xcollab.app?subject=%5BDISCLOSURE%5D%20xCollab%20Security"
          />

          <ContactCard
            icon={BookDashed}
            tone="sky"
            title="Product & Partnerships"
            meta="partners@xcollab.app"
            summary="Agency partnerships, enterprise brand roster onboarding, talent-manager accounts, creator-collective bulk sign-ups, PR, media requests, and speaking inquiries."
            actionLabel="Email partners@xcollab.app"
            href="mailto:partners@xcollab.app?subject=xCollab%20Partnership%20Inquiry"
          />

          <ContactCard
            icon={Mail}
            tone="amber"
            title="DPO · Data Protection"
            meta="privacy@xcollab.app"
            summary="Subject-access requests, right-to-be-forgotten with financial-ledger carve-out confirmation, DPIA requests, cookie audits, or audit of what specific data xCollab holds about your account."
            actionLabel="Email privacy@xcollab.app"
            href="mailto:privacy@xcollab.app?subject=%5BDP%20Request%5D%20xCollab"
          />

          <div className="flex h-full flex-col gap-3 border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-700 ring-1 ring-inset ring-slate-200 bg-white">
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-950">Quick links</h2>
                <p className="text-[11px] font-medium text-slate-500">
                  Self-serve resources that usually resolve the issue
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950"
                >
                  <span className="h-1 w-1 rounded-full bg-violet-500" aria-hidden="true" />
                  Terms of Service — escrow & deliverables
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950"
                >
                  <span className="h-1 w-1 rounded-full bg-violet-500" aria-hidden="true" />
                  Privacy Policy — OAuth vault & deletion framework
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950"
                >
                  <span className="h-1 w-1 rounded-full bg-violet-500" aria-hidden="true" />
                  Cookie Policy — 4-key minimal footprint
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950"
                >
                  <span className="h-1 w-1 rounded-full bg-violet-500" aria-hidden="true" />
                  Account Settings — exports, revokes, closure
                </Link>
              </li>
              <li>
                <Link
                  href="/campaigns"
                  className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-950"
                >
                  <span className="h-1 w-1 rounded-full bg-violet-500" aria-hidden="true" />
                  Browse open marketplace campaigns
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
