import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | xCollab",
  description:
    "xCollab Cookie Policy: NextAuth session cookies for authentication, workspace preference storage (dark mode), and the minimal browser footprint we use to run the escrow marketplace.",
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

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 sm:px-8">
          <img
            src="/logo.png"
            alt="xCollab"
            className="h-6 w-auto"
          />
          <div className="h-5 w-px bg-slate-200" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
            Legal · Cookie Policy
          </p>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700">
              <Cookie aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">
                xCollab Cookie Policy
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Last updated: October 5, 2026 · xCollab keeps its cookie
                footprint intentionally tiny. No advertising, no cross-site
                trackers, no third-party pixels — just session auth and a
                single workspace preference value.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-8">
          <div className="overflow-hidden border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase text-slate-700 sm:px-5"
                  >
                    Cookie / Key name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase text-slate-700 sm:px-5"
                  >
                    Purpose
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase text-slate-700 sm:px-5"
                  >
                    Expiry
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase text-slate-700 sm:px-5"
                  >
                    Storage layer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                <tr>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-slate-900 sm:px-5">
                    authjs.session-token
                    <span className="ml-2 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                      Strictly necessary
                    </span>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    NextAuth encrypted session cookie for authenticated states.
                    Keeps you signed in between page navigations and verifies
                    your access to escrow balances, applications, and ledger
                    views.
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                    30 days (rotated on role change)
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                    HTTP-only cookie · Secure · SameSite=Lax
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-slate-900 sm:px-5">
                    authjs.csrf-token
                    <span className="ml-2 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                      Strictly necessary
                    </span>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    CSRF anti-forgery token for application/json mutation
                    endpoints (campaign creation, application submissions,
                    escrow actions). Protects against cross-site request
                    forgery of financial state changes.
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">Session</td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">Cookie</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-slate-900 sm:px-5">
                    data-theme
                    <span className="ml-2 inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
                      Preference
                    </span>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    Workspace visual preference set by the PreferencesPanel
                    toggle (&quot;dark&quot; or &quot;light&quot;). Caches your
                    selected theme so your slate / charcoal layout renders
                    consistently between visits without a server round-trip.
                    <em> Never transmitted to the server.</em>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">Persistent</td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">
                      localStorage
                    </code>{" "}
                    · Browser only
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-slate-900 sm:px-5">
                    xcollab.preferences
                    <span className="ml-2 inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
                      Preference
                    </span>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    JSON-encoded workspace visual preference snapshot (compact
                    sidebar mode, accent color choice, filter bar defaults).
                    Never transmitted to the server in the request body or
                    headers.
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">Persistent</td>
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">
                      localStorage
                    </code>{" "}
                    · Browser only
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8 px-5 py-8 sm:px-8 sm:py-10">
          <Section id="no-third-party" title="1. No Third-Party Cookies">
            <p>
              xCollab drops <strong>zero third-party advertising cookies</strong>{" "}
              and does not install cross-site tracking pixels. Payment flows
              are handled by Razorpay on their own domain — any cookies set
              during a Razorpay checkout session are governed by the
              <a
                href="https://razorpay.com/privacy/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-violet-700 hover:text-violet-900"
              >
                {" "}
                Razorpay Privacy Policy
              </a>
              , not this one.
            </p>
          </Section>

          <Section id="authentication-states" title="2. NextAuth Authentication State Cookies">
            <p>
              The <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">authjs.session-token</code>{" "}
              cookie is the only long-lived browser credential xCollab uses.
              Its payload is an opaque encrypted JWT produced by NextAuth and
              contains the session user id, email, and active role. It is:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Flagged <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">HttpOnly</code>{" "}
                so client-side JavaScript cannot read it — XSS-resistant by
                design.
              </li>
              <li>
                Flagged <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">Secure</code>{" "}
                so it is only transmitted over HTTPS (never HTTP, even for
                local dev in production builds).
              </li>
              <li>
                Flagged <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">SameSite=Lax</code>{" "}
                so it is never attached to cross-site subrequests, blocking
                CSRF against escrow endpoints.
              </li>
              <li>
                <strong>Actively rotated</strong> whenever a user&apos;s role
                changes (for example CREATOR → ADMIN or vice versa) — stale
                JWTs for a different role are rejected even if still within
                the 30-day window.
              </li>
            </ul>
          </Section>

          <Section id="preferences" title="3. Workspace Preference Storage">
            <p>
              The PreferencesPanel writes two keys to browser{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">window.localStorage</code>{" "}
              when you customize your workspace:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">data-theme</code>{" "}
                — string literal <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">&quot;dark&quot;</code>{" "}
                or <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">&quot;light&quot;</code>.
                The client applies the corresponding{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">html[data-theme=&quot;dark&quot;]</code>{" "}
                CSS overrides to swap bg-white surfaces for the charcoal /
                slate-800 palette.
              </li>
              <li>
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">xcollab.preferences</code>{" "}
                — small JSON blob (always under 2kb) for UX preferences like
                compact sidebar, default niche filter, and campaign sort
                column.
              </li>
            </ul>
            <p>
              <em>
                Neither key is ever transmitted to the server in headers,
                request bodies, URL query strings, or analytics beacons.
              </em>{" "}
              They exist purely client-side to preserve your visual layout.
            </p>
          </Section>

          <Section id="management" title="4. How to Manage or Delete Cookies">
            <p>
              Signing out via the top-right avatar menu → &quot;Sign out&quot;
              clears the NextAuth session and CSRF cookies automatically. To
              wipe workspace preferences: open the browser&apos;s DevTools →
              Application → Local Storage →{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">clear()</code>,
              or use the PreferencesPanel → &quot;Reset workspace defaults&quot;
              button when present.
            </p>
            <p>
              Because the only long-lived credential is{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">HttpOnly</code>,
              it cannot be cleared from JavaScript — use your browser&apos;s
              cookie manager, or sign out through the application menu.
            </p>
          </Section>

          <Section id="changes" title="5. Changes">
            <p>
              We&apos;ll bump the &quot;Last updated&quot; date above whenever
              we add, remove, or reclassify a cookie. Material expansions
              (i.e. adding any third-party cookie, which we have no current
              plans to do) are notified 30 days in advance by in-app banner
              and, for accounts with open escrow, by email.
            </p>
            <p>
              Questions about cookies or a specific audit of what was set on
              your session: email
              <a
                href="mailto:privacy@xcollab.app"
                className="ml-1 font-medium text-violet-700 hover:text-violet-900"
              >
                privacy@xcollab.app
              </a>{" "}
              or open the
              <Link
                href="/contact"
                className="ml-1 font-medium text-violet-700 hover:text-violet-900"
              >
                Support &amp; Contact
              </Link>{" "}
              hub.
            </p>
          </Section>

          <div className="flex items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-4">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-700" />
            <p className="text-xs leading-5 text-slate-700">
              <strong className="text-slate-950">Minimal by design.</strong>{" "}
              The xCollab platform operates entirely on four storage keys
              total — two server-issued cookies for auth integrity and two
              client-only keys for your visual layout. Nothing else.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
