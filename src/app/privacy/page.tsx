import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Eye,
  KeyRound,
  PieChart,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | xCollab",
  description:
    "xCollab's Privacy Policy: encrypted OAuth token vault for YouTube/Instagram/TikTok, discovery roster data visibility rules, creator audit logs, and user data deletion framework.",
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
    href: "#collection",
    icon: Eye,
    title: "What We Collect",
    body: "Profiles · audience · submissions.",
  },
  {
    href: "#oauth",
    icon: KeyRound,
    title: "Encrypted OAuth Vault",
    body: "YouTube · Meta · TikTok scopes.",
  },
  {
    href: "#visibility",
    icon: PieChart,
    title: "Roster Visibility Rules",
    body: "What brands can & cannot see.",
  },
  {
    href: "#deletion",
    icon: ShieldCheck,
    title: "Data Deletion Framework",
    body: "Self-serve + DPO request routes.",
  },
];

export default function PrivacyPolicyPage() {
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
            Legal · Privacy Policy
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <h1 className="text-2xl font-semibold text-slate-950">
            xCollab Marketplace Privacy Policy
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Last updated: October 5, 2026 · What we collect, how we secure
            OAuth credentials, what information is visible on the discovery
            roster, and exactly how to export or delete your data.
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
          <Section id="controller" title="1. Controller & Applicability">
            <p>
              This Privacy Policy is issued by <strong>xCollab, Inc.</strong>{" "}
              (&quot;Controller&quot;), registered in Bengaluru, Karnataka,
              India. It covers every xCollab account (Brand, Creator, Admin),
              public portfolio pages at
              <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">
                /p/[handle]
              </code>
              , the Google/YouTube, Meta, and TikTok OAuth sync integrations,
              and all Razorpay payment flows described in the Terms of Service.
            </p>
            <p>
              For EEA/UK/Swiss visitors we process under (a) explicit consent
              for social OAuth scopes, (b) contractual necessity for escrow
              services, and (c) legitimate interest for anti-fraud and
              marketplace integrity. For Indian visitors this policy complies
              with the Digital Personal Data Protection Act, 2023.
            </p>
          </Section>

          <Section id="collection" title="2. Categories of Data We Collect">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Account identity.</strong> Name, email, bcrypt-hashed
                password (xCollab never stores plaintext), phone (if supplied
                for Razorpay KYC), declared role, login IP, and OAuth provider
                records. Required to operate your account.
              </li>
              <li>
                <strong>CreatorProfile.</strong> Public handle, content niche,
                self-reported follower counts, bio summary, and per-platform
                synced metrics (YouTube subs &amp; views, Instagram followers
                &amp; engagement, TikTok followers &amp; likes).
              </li>
              <li>
                <strong>BrandProfile.</strong> Company name, declared
                operating budget, campaign roster, and Razorpay billing
                contact details. Required to issue escrow invoices.
              </li>
              <li>
                <strong>Campaigns, applications, submissions.</strong> Every
                record in the <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">Campaign</code>,
                <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">CampaignApplication</code>,
                and{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">Submission</code>{" "}
                tables — niche, budget, post URLs, screenshots, timestamps.
                Retained for the account lifetime + 7 years for tax.
              </li>
              <li>
                <strong>Financial / transaction.</strong> Razorpay order IDs,
                settlement statuses, and escrow release/refund audit logs.
                Full card numbers, CVVs, and UPI VPA strings are never stored
                on xCollab infrastructure — Razorpay tokenizes them at capture
                and we retain only a masked last-4 reference.
              </li>
              <li>
                <strong>Usage &amp; preferences.</strong> JWT session tokens,
                theme preference (dark / light), FilterBar search queries,
                and notification-opened events. Used only for product
                improvement and shell personalization.
              </li>
            </ul>
          </Section>

          <Section id="oauth" title="3. Encrypted OAuth Token Storage">
            <p>
              The Settings → Sync panel lets Creators link Google/YouTube,
              Meta, and TikTok via standard <strong>OAuth 2.0 + PKCE</strong>.
              xCollab never sees your social password.
            </p>

            <div className="divide-y divide-slate-200 border border-slate-200">
              <div className="grid gap-2 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                <p className="text-xs font-semibold text-slate-900">Provider</p>
                <p className="text-xs font-semibold text-slate-900">Requested scopes</p>
                <p className="text-xs font-semibold text-slate-900">Used for</p>
              </div>
              <div className="grid gap-2 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <BadgeCheck aria-hidden="true" className="h-4 w-4 text-red-500" />
                  Google · YouTube
                </p>
                <p className="text-xs text-slate-600">
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">openid</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">email</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">profile</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">youtube.readonly</code>
                  <span className="mt-1 block text-slate-500">
                    (offline access + PKCE consent)
                  </span>
                </p>
                <p className="text-xs text-slate-600">
                  Channel subscriber count, total views, per-video averages
                  for CreatorProfile cards &amp; the Demographics chart.
                </p>
              </div>
              <div className="grid gap-2 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <BadgeCheck aria-hidden="true" className="h-4 w-4 text-pink-600" />
                  Meta · Instagram
                </p>
                <p className="text-xs text-slate-600">
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">public_profile</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">email</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">instagram_basic</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">instagram_manage_insights</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">pages_show_list</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">pages_read_engagement</code>
                </p>
                <p className="text-xs text-slate-600">
                  IG follower count, profile bio, 90-day engagement rate,
                  age/gender demographics. Only explicitly Page-granted
                  accounts are linked — we never auto-scan personal profiles.
                </p>
              </div>
              <div className="grid gap-2 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <BadgeCheck aria-hidden="true" className="h-4 w-4 text-slate-900" />
                  TikTok · Login Kit
                </p>
                <p className="text-xs text-slate-600">
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">user.info.basic</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">user.info.profile</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">user.info.stats</code>{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">video.list</code>
                </p>
                <p className="text-xs text-slate-600">
                  TikTok follower count, profile avatar, 30-day average
                  likes, and the 10 most recent public video previews for the
                  ContentFeed widget.
                </p>
              </div>
            </div>

            <p className="pt-1">
              <strong>Token vault.</strong> OAuth access_token / refresh_token
              values receive <em>two layers</em> of protection: the Prisma
              Postgres database is already encrypted at-rest by our managed
              provider, and in addition xCollab encrypts every OAuth token
              value with <strong>AES-256-GCM envelope encryption</strong>{" "}
              using HKDF-derived DEKs wrapped by a KMS-held master key. A
              full-database compromise would not expose usable OAuth
              credentials. Revoke any binding from Settings → Connections —
              tokens are hard-deleted within 60 seconds and portfolio metrics
              are zeroed.
            </p>
          </Section>

          <Section id="visibility" title="4. Discovery Roster — Data Visibility Rules">
            <p>
              The <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">/creators</code>{" "}
              discovery roster and the public{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">/p/[handle]</code>{" "}
              portfolio expose only these fields — everything else is private:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <em>Visible to signed-in Brands (and anonymous public):</em>{" "}
                public handle, avatar, content niche, bio summary, self-reported
                follower count per platform, <em>verified</em> vs{" "}
                <em>self-reported</em> badge per platform, top-performing
                post previews in ContentFeed, a single aggregate EMV score,
                and a single aggregate engagement-rate percentage.
              </li>
              <li>
                <em>Never visible outside xCollab or to other Creators:</em>{" "}
                raw OAuth tokens, raw access tokens, email addresses unless
                the Creator publishes a public-contact email, campaign
                application history for campaigns the viewer did not post,
                escrow balances, settlement UPI/merchant targets, private
                CreatorProfile notes, search history, and any audience
                individual-level demographic records.
              </li>
              <li>
                <em>Blended demographics only.</em> Age-range, gender, and
                top-country distributions are always rendered as weighted,
                platform-blended buckets — no individual-level record is
                ever shared.
              </li>
            </ul>
          </Section>

          <Section id="analytics" title="5. Analytics We Derive">
            <p>
              Beyond raw provider data xCollab computes and stores derived
              analytics to power the marketplace matching engine and surface
              ROI to both sides: <em>Earned Media Value (EMV)</em>,{" "}
              <em>Engagement Rate, ROI, CPM, CPE</em>, blended demographic
              buckets, and an 180-day FollowerGrowth time-series (then
              collapsed to weekly aggregates). Derived records follow the
              same retention schedule in §6.
            </p>
          </Section>

          <Section id="security" title="6. Security & Retention Schedule">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Passwords: bcrypt cost factor 12.
              </li>
              <li>
                Traffic: HTTPS-only with HSTS. Cookies: secure + httponly +
                samesite=lax; JWTs expire after 30 days with role-change
                active rotation.
              </li>
              <li>
                Retention: Accounts &amp; profiles — account lifetime + 7
                years. Campaign/escrow/submission ledgers — 7 years post
                settlement for tax/audit. Raw OAuth metric snapshots — 180
                days rolled to weekly aggregates. Usage/preference events —
                13 months then summarized. Newsletter — until unsubscribe.
              </li>
            </ul>
          </Section>

          <Section id="sharing" title="7. Who We Share Data With">
            <p>
              xCollab does not sell personal data. Sharing is limited to
              processors:
              <strong> Razorpay Payments</strong> (order/settlement fields
              only), the <strong>NextAuth session backend</strong>,
              CDN/object storage (uploaded screenshots and profile images,
              never sensitive fields), and law enforcement where a valid,
              narrowly scoped court order or subpoena compels disclosure (with
              prior notice to the data subject where legally permitted).
            </p>
          </Section>

          <Section id="deletion" title="8. Data Deletion Framework">
            <p>
              Most actions are <strong>self-serve</strong>: data exports
              (Settings panel), profile corrections (ProfileForm), OAuth
              revocations (SyncDataPanel), account closure (SecurityPanel).
              Financial ledgers and open escrows follow their legal retention
              window — deletion requests freeze open escrows so they may
              still settle or refund, then the underlying personal data is
              redacted or hard-deleted within 45 days.
            </p>
            <p>
              For requests that cannot be self-served (including GDPR/DPDP
              subject-access requests, right-to-be-forgotten with ledger
              carve-out confirmation, or DPIA requests) email our Data
              Protection Officer at
              <a
                href="mailto:privacy@xcollab.app"
                className="ml-1 font-medium text-violet-700 hover:text-violet-900"
              >
                privacy@xcollab.app
              </a>{" "}
              with subject line <em>&quot;DP Request — [your email]&quot;</em>.
              We respond to verifiable requests within 30 calendar days (60
              days for complex or voluminous requests where permitted by
              law).
            </p>
          </Section>

          <Section id="children" title="9. Children&apos;s Privacy">
            <p>
              xCollab is not directed to children under 16 (or the applicable
              digital age of consent in your jurisdiction, whichever is
              higher). Accounts discovered to belong to an ineligible minor
              are closed and personal data deleted within 48 hours. Report
              suspected minor accounts to
              <a
                href="mailto:privacy@xcollab.app"
                className="ml-1 font-medium text-violet-700 hover:text-violet-900"
              >
                privacy@xcollab.app
              </a>
              .
            </p>
          </Section>

          <Section id="changes" title="10. Changes to This Policy">
            <p>
              Material changes are notified by in-app banner at next sign-in
              and by email to accounts with open escrow, effective 30 days
              after posting. Non-material clarifications take effect
              immediately. The canonical, most-recent version always lives at
              <Link
                href="/privacy"
                className="ml-1 font-medium text-violet-700 hover:text-violet-900"
              >
                /privacy
              </Link>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
