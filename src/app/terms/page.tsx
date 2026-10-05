import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  FileCheck,
  Lock,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | xCollab",
  description:
    "Legal terms governing xCollab's creator & brand escrow marketplace: Razorpay escrow lock mechanics, deliverable timelines, multi-platform verification bindings, and platform service fees.",
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 space-y-3 border-t border-slate-200 pt-5 first:border-t-0 first:pt-0"
    >
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-slate-700">
        {children}
      </div>
    </section>
  );
}

const navCards = [
  {
    href: "#escrow",
    icon: Lock,
    title: "Razorpay Escrow Locks",
    body: "Budget capture, hold lifecycle, release triggers.",
  },
  {
    href: "#execution",
    icon: FileCheck,
    title: "Deliverable Timelines",
    body: "Deadlines, submissions, approval windows.",
  },
  {
    href: "#verification",
    icon: BadgeCheck,
    title: "OAuth Analytics",
    body: "YouTube, Meta, TikTok verification scope.",
  },
  {
    href: "#fees",
    icon: ShieldCheck,
    title: "Platform Service Fees",
    body: "Commission structure & refund schedule.",
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 sm:px-8">
          <img
            src="/logo.png"
            alt="xCollab"
            className="h-6 w-auto"
          />
          <div className="h-5 w-px bg-slate-200" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
            Legal · Terms of Service
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <h1 className="text-2xl font-semibold text-slate-950">
            xCollab Marketplace Terms
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Last updated: October 5, 2026 · A binding contract between your
            account and xCollab, Inc. that governs campaigns, applications,
            escrow locks, deliverables, and payouts on the marketplace.
          </p>
        </div>

        <div className="grid gap-3 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {navCards.map(({ href, icon: Icon, title, body }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-3 border border-slate-200 bg-white p-3 transition hover:border-slate-400"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:bg-white">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-900">
                  {title}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-slate-700"
                  />
                </span>
                <span className="mt-1 block text-[11px] leading-5 text-slate-500">
                  {body}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="space-y-8 px-5 py-8 sm:px-8 sm:py-10">
          <Section id="parties" title="1. Parties & Account Eligibility">
            <p>
              These Terms of Service (&quot;Terms&quot;) form a legal agreement
              between <strong>xCollab, Inc.</strong> (&quot;xCollab&quot;,
              &quot;we&quot;, &quot;us&quot;) and the individual or business
              entity holding an account on the platform (&quot;you&quot;,
              &quot;your&quot;). xCollab operates a two-sided digital
              marketplace where <em>Brand</em> accounts post marketing
              campaigns and <em>Creator</em> accounts apply for, execute, and
              deliver those campaigns against Razorpay-escrowed compensation.
            </p>
            <p>
              You must be at least 18 years old (or the age of majority in
              your jurisdiction) to open an account. Brand accounts warrant
              that the signatory has authority to bind the represented
              business. Creator accounts warrant that every social media
              identity linked to the profile through OAuth is lawfully owned
              or controlled by the account holder.
            </p>
          </Section>

          <Section id="escrow" title="2. Razorpay Escrow Fund Locks">
            <p>
              <strong>Budget capture.</strong> When a Brand publishes a
              campaign, the full <em>totalBudget</em> is quoted via a Razorpay
              order (<code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">razorpayOrderId</code>).
              On successful capture the campaign moves from{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">PENDING_PAYMENT</code>{" "}
              → <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">ESCROW_LOCKED</code>.
              While funds remain in escrow they are held by Razorpay Payments
              Private Limited under a designated partner sub-account and are
              not available to xCollab operating accounts, the Brand&apos;s
              general balance, or creditors of either party.
            </p>
            <p>
              <strong>72-hour approval window.</strong> When a Creator posts a
              submission the campaign transitions to{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">SUBMITTED</code>{" "}
              and a 72-hour approval countdown begins. If the Brand takes no
              action during this window, the submission is deemed approved by
              default and the escrow is automatically queued for release.
            </p>
            <p>
              <strong>Release &amp; refund triggers.</strong> On Brand approval
              the campaign moves to{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">COMPLETED</code>{" "}
              and escrow is released to the Creator&apos;s linked Razorpay
              merchant or UPI account within two (2) business days. On formal
              rejection with documented reasoning, or after a missed campaign
              deadline, funds are routed to the{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">REFUNDED</code>{" "}
              state and returned to the Brand&apos;s original payment method,
              net of non-refundable platform fees in §5.
            </p>
          </Section>

          <Section id="execution" title="3. Deliverable Timelines & Execution">
            <p>
              Each <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">CampaignApplication</code>{" "}
              the Brand accepts (application status →{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">ACCEPTED</code>)
              is a separate digital-services micro-contract between the named
              Brand and Creator on the deliverable schedule, platforms,
              guidelines, and budget range stated on the campaign at time of
              acceptance. xCollab is not a party to this micro-contract — we
              operate solely as escrow agent, identity verification provider,
              and submission channel.
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <em>Deliverables.</em> Each item in the{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">deliverables[]</code>{" "}
                array must be matched by a{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">Submission</code>{" "}
                containing a <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">postUrl</code>{" "}
                and supporting screenshot.
              </li>
              <li>
                <em>Deadlines are hard.</em> Submissions posted after the
                campaign <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">deadline</code>{" "}
                may be rejected without review and the escrow refunded to the
                Brand unless a written extension is granted.
              </li>
              <li>
                <em>Revisions.</em> Brands are entitled to one (1) free
                revision round per accepted application. Extra revision
                rounds must be negotiated separately and funded through a new
                top-up order before escrow is re-locked.
              </li>
            </ul>
          </Section>

          <Section id="verification" title="4. OAuth Analytics & Verification Bindings">
            <p>
              Creators may link three providers to verify metrics on their
              public portfolio: <strong>Google / YouTube</strong> (YouTube Data
              API v3, read-only analytics scopes),{" "}
              <strong>Meta / Facebook &amp; Instagram</strong> (Instagram
              Basic Display + Insights + Pages Show List), and{" "}
              <strong>TikTok</strong> (Login Kit with user.info, stats, and
              video.list scopes).
            </p>
            <p>
              By connecting a social account you grant xCollab a limited,
              revocable right to pull follower counts, engagement rates,
              demographics, and top-performing posts purely to render your
              CreatorProfile and to match Brands through the marketplace
              search. Verified platforms appear as <em>Verified</em> on public
              pages; unverified / manual entries appear as{" "}
              <em>Self-reported</em> and Brands may filter accordingly.
            </p>
            <p>
              OAuth <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">access_token</code>{" "}
              and{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">refresh_token</code>{" "}
              pairs are stored at-rest using AES-256-GCM envelope encryption
              in xCollab&apos;s token vault. Revoke any binding from Settings
              → Connections — we delete both tokens within 60 seconds and mark
              the platform unverified.
            </p>
          </Section>

          <Section id="fees" title="5. Platform Service Fees">
            <p>
              xCollab only charges fees on <em>successfully settled</em>{" "}
              escrow transactions. There are no signup, listing, browsing, or
              application fees.
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Marketplace commission.</strong> 12% is deducted from
                the escrow release on every{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">COMPLETED</code>{" "}
                campaign before the remaining 88% is paid to the Creator.
              </li>
              <li>
                <strong>Refund schedule.</strong> On{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">REFUNDED</code>{" "}
                campaigns the 12% commission is not charged; a 2.5%
                cancellation fee (capped at $250 USD) is retained to cover
                payment-processing, verification, and matching costs.
              </li>
              <li>
                <strong>Premium campaigns.</strong> Campaigns flagged{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">isPremium</code>{" "}
                receive top placement and a reduced 9% commission. Premium
                listing is billed separately at campaign creation time.
              </li>
            </ul>
            <p>
              Tax-compliant settlement receipts are issued through Razorpay&apos;s
              invoicing product and can be downloaded from the Brand Payments
              / Creator Earnings ledgers at any time.
            </p>
          </Section>

          <Section id="content-license" title="6. Content License & Usage Rights">
            <p>
              Unless the parties execute a separate usage-rights addendum, a
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700"> COMPLETED</code>{" "}
              campaign grants the Brand a worldwide, non-exclusive, royalty-free
              license to display, repost, boost, and promote the submitted
              content for twelve (12) months from the approval date, exclusively
              across the platforms and channels listed on the campaign record.
              The Creator retains underlying copyright and may re-use the work
              freely after the term unless an extended buyout was signed.
            </p>
          </Section>

          <Section id="termination" title="7. Termination, Suspension & Disputes">
            <p>
              Either party may close their account from Settings → Security.
              Open escrows continue their natural lifecycle even after closure;
              you may reopen within 30 days to collect final settlement.
            </p>
            <p>
              xCollab may suspend or terminate accounts for material breach,
              marketplace manipulation (fakes, collusion, fee circumvention),
              repeated complaints, or a lawful regulator/court request.
              Suspended accounts receive a 14 calendar-day cure window before
              escrows are refunded and accounts closed permanently.
            </p>
            <p>
              <strong>Disputes.</strong> Escrow disputes first go through
              xCollab&apos;s in-platform mediator for a non-binding
              recommendation within 10 business days. Unresolved disputes are
              finally settled by confidential, binding arbitration in
              Bengaluru, Karnataka, India under the Indian Arbitration and
              Conciliation Act, 1996 — each party bears its own legal fees.
            </p>
          </Section>

          <Section id="misc" title="8. General Provisions">
            <p>
              These Terms together with the xCollab Privacy Policy and any
              campaign-specific addendum form the entire agreement between you
              and xCollab. Material revisions are posted 30 calendar days in
              advance via in-app banner; the latest version always lives at
              <Link
                href="/terms"
                className="ml-1 font-medium text-violet-700 hover:text-violet-900"
              >
                /terms
              </Link>
              . Legal notices to:
              <a
                href="mailto:legal@xcollab.app"
                className="ml-1 font-medium text-violet-700 hover:text-violet-900"
              >
                legal@xcollab.app
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
