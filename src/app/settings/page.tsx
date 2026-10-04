import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConnectionGrid, type SocialProvider } from "@/components/settings/ConnectionGrid";
import { ManualMetricForm } from "@/components/settings/ManualMetricForm";
import { SyncDataPanel } from "@/components/settings/SyncDataPanel";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SecurityPanel } from "@/components/settings/SecurityPanel";
import { PreferencesPanel } from "@/components/settings/PreferencesPanel";

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

        <ProfileForm
          initialName={session.user.name ?? ""}
          initialEmail={session.user.email ?? ""}
          roleLabel={roleLabel}
        />
      </section>

      {/* ── Section 2: Security — all roles ── */}
      <section className="space-y-5 border-t border-slate-200 pt-8 pb-8">
        <header>
          <h2 className="text-base font-semibold text-slate-950">Security</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage your password and two-factor authentication.
          </p>
        </header>

        <SecurityPanel />
      </section>

      {/* ── Section 3: Preferences — all roles ── */}
      <section className="space-y-5 border-t border-slate-200 pt-8 pb-8">
        <header>
          <h2 className="text-base font-semibold text-slate-950">Preferences</h2>
          <p className="mt-1 text-sm text-slate-600">
            Appearance and regional settings.
          </p>
        </header>

        <PreferencesPanel />
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