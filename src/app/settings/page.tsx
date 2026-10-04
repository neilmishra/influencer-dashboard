import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConnectionGrid, type SocialProvider } from "@/components/settings/ConnectionGrid";
import { ManualMetricForm } from "@/components/settings/ManualMetricForm";
import { SyncDataPanel } from "@/components/settings/SyncDataPanel";

const providers = ["google", "facebook", "tiktok"] as const satisfies readonly SocialProvider[];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const isCreator = session.user.role === "CREATOR";

  // OAuth account data and connection status are only relevant for Creators.
  // All three variables stay null for Brand / Admin — no DB work is done.
  let connected: Record<SocialProvider, boolean> | null = null;
  let configured: Record<SocialProvider, boolean> | null = null;
  let creatorProfile: Awaited<ReturnType<typeof prisma.creatorProfile.findUnique>> = null;

  if (isCreator) {
    // Fetch all linked OAuth accounts in one query, then derive the boolean map.
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        provider: { in: [...providers] },
      },
      select: {
        provider: true,
        access_token: true,
        refresh_token: true,
      },
    });

    connected = Object.fromEntries(
      providers.map((provider) => [
        provider,
        accounts.some(
          (account) =>
            account.provider === provider &&
            Boolean(account.access_token || account.refresh_token),
        ),
      ]),
    ) as Record<SocialProvider, boolean>;

    configured = {
      google:   Boolean(process.env.GOOGLE_CLIENT_ID   && process.env.GOOGLE_CLIENT_SECRET),
      facebook: Boolean(process.env.META_CLIENT_ID     && process.env.META_CLIENT_SECRET),
      tiktok:   Boolean(process.env.TIKTOK_CLIENT_ID   && process.env.TIKTOK_CLIENT_SECRET),
    };

    creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        category: true,
        bioSummary: true,
        publicContactEmail: true,
        youtubeFollowers: true,
        youtubeAverageViews: true,
        instagramFollowers: true,
        instagramAverageEngagementRate: true,
        tiktokFollowers: true,
        tiktokAverageLikes: true,
      },
    });
  }

  const roleLabel =
    session.user.role.charAt(0) + session.user.role.slice(1).toLowerCase();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-0">

      {/* ── Page header — all roles ── */}
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
          Settings
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Account Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Manage your profile, security, and platform connections.
        </p>
      </header>

      {/* ── Section 1: Profile Information — all roles ── */}
      <section className="space-y-5 border-t border-slate-200 pt-8 pb-8">
        <header>
          <h2 className="text-base font-semibold text-slate-950">
            Profile Information
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Your public-facing identity on xCollab.
          </p>
        </header>

        <div className="grid max-w-xl gap-0 divide-y divide-slate-100 rounded border border-slate-200 bg-white text-sm">
          {/* Avatar */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="font-medium text-slate-700">Photo</span>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600" aria-hidden="true" />
              <button
                type="button"
                className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <label htmlFor="settings-name" className="font-medium text-slate-700">
              Full name
            </label>
            <input
              id="settings-name"
              type="text"
              defaultValue={session.user.name ?? ""}
              placeholder="Your name"
              className="h-9 w-56 rounded border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Email */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <label htmlFor="settings-email" className="font-medium text-slate-700">
              Email address
            </label>
            <input
              id="settings-email"
              type="email"
              defaultValue={session.user.email ?? ""}
              placeholder="you@example.com"
              className="h-9 w-56 rounded border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Role — read-only */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="font-medium text-slate-700">Role</span>
            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">
              {roleLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded border border-slate-300 bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          Save changes
        </button>
      </section>

      {/* ── Section 2: Security — all roles ── */}
      {/* TODO: wire "Change password" to a server action and 2FA to an authenticator flow */}
      <section className="space-y-5 border-t border-slate-200 pt-8 pb-8">
        <header>
          <h2 className="text-base font-semibold text-slate-950">Security</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage your password and two-factor authentication.
          </p>
        </header>

        <div className="grid max-w-xl gap-0 divide-y divide-slate-100 rounded border border-slate-200 bg-white text-sm">
          {/* Password */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-medium text-slate-700">Password</p>
              <p className="mt-0.5 text-xs text-slate-500">Last changed — never</p>
            </div>
            <button
              type="button"
              className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              Change password
            </button>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-medium text-slate-700">
                Two-factor authentication
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Add a second layer of security to your account.
              </p>
            </div>
            {/* Toggle stub — replace with a controlled client component when wiring 2FA */}
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
      </section>

      {/* ── Section 3: Preferences — all roles ── */}
      {/* TODO: wire dark-mode to a theme context and time zone to a user preference API */}
      <section className="space-y-5 border-t border-slate-200 pt-8 pb-8">
        <header>
          <h2 className="text-base font-semibold text-slate-950">Preferences</h2>
          <p className="mt-1 text-sm text-slate-600">
            Appearance and regional settings.
          </p>
        </header>

        <div className="grid max-w-xl gap-0 divide-y divide-slate-100 rounded border border-slate-200 bg-white text-sm">
          {/* Dark mode */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-medium text-slate-700">Dark mode</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Switch the dashboard to a dark colour scheme.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked="false"
              aria-label="Enable dark mode"
              className="relative h-6 w-11 flex-shrink-0 rounded-full bg-slate-200 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
            </button>
          </div>

          {/* Time zone */}
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <label htmlFor="settings-timezone" className="font-medium text-slate-700">
              Time zone
            </label>
            <select
              id="settings-timezone"
              defaultValue="UTC"
              className="h-9 w-56 rounded border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-violet-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time — New York</option>
              <option value="America/Chicago">Central Time — Chicago</option>
              <option value="America/Denver">Mountain Time — Denver</option>
              <option value="America/Los_Angeles">Pacific Time — Los Angeles</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Kolkata">India Standard Time</option>
              <option value="Asia/Tokyo">Japan Standard Time</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Section 4: Social Data Connections — CREATOR only ── */}
      {/* Section header AND ConnectionGrid both live inside this guard so no
          orphaned heading is ever shown to BRAND or ADMIN users. */}
      {isCreator && connected && configured && (
        <section className="space-y-5 border-t border-slate-200 pt-8 pb-8">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              Integrations
            </p>
            <h2 className="mt-2 text-base font-semibold text-slate-950">
              Social Data Connections
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Connect your creator accounts to sync channel, audience, and
              video performance data automatically.
            </p>
          </header>
          <ConnectionGrid connected={connected} configured={configured} />
        </section>
      )}

      {/* ── Sync + Manual Metrics — CREATOR only ── */}
      {isCreator && (
        <>
          <SyncDataPanel />
          <section className="space-y-5 border-t border-slate-200 pt-8 pb-8">
            <header>
              <h2 className="text-base font-semibold text-slate-950">
                Manual Metric Overrides
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Add self-reported metrics for any platform you prefer not to
                connect. These values are shown with a self-reported label on
                your public portfolio.
              </p>
            </header>
            <ManualMetricForm
              values={{
                category: creatorProfile?.category ?? "",
                bioSummary: creatorProfile?.bioSummary ?? "",
                publicContactEmail: creatorProfile?.publicContactEmail ?? "",
                youtubeFollowers: creatorProfile?.youtubeFollowers ?? null,
                youtubeAverageViews: creatorProfile?.youtubeAverageViews ?? null,
                instagramFollowers: creatorProfile?.instagramFollowers ?? null,
                instagramAverageEngagementRate:
                  creatorProfile?.instagramAverageEngagementRate ?? null,
                tiktokFollowers: creatorProfile?.tiktokFollowers ?? null,
                tiktokAverageLikes: creatorProfile?.tiktokAverageLikes ?? null,
              }}
            />
          </section>
        </>
      )}
    </div>
  );
}