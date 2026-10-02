import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConnectionGrid, type SocialProvider } from "@/components/settings/ConnectionGrid";
import { ManualMetricForm } from "@/components/settings/ManualMetricForm";

const providers = ["google", "facebook", "tiktok"] as const satisfies readonly SocialProvider[];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

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

  const connected = Object.fromEntries(
    providers.map((provider) => [
      provider,
      accounts.some(
        (account) =>
          account.provider === provider && Boolean(account.access_token || account.refresh_token),
      ),
    ]),
  ) as Record<SocialProvider, boolean>;

  const configured = {
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    facebook: Boolean(process.env.META_CLIENT_ID && process.env.META_CLIENT_SECRET),
    tiktok: Boolean(process.env.TIKTOK_CLIENT_ID && process.env.TIKTOK_CLIENT_SECRET),
  };
  const creatorProfile = session.user.role === "CREATOR"
    ? await prisma.creatorProfile.findUnique({
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
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
          Integrations
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Automated Data Connections
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Connect creator accounts to sync channel, audience, and video performance data.
        </p>
      </header>

      <ConnectionGrid connected={connected} configured={configured} />

      {session.user.role === "CREATOR" ? (
        <section className="space-y-5 border-t border-slate-200 pt-8">
          <header>
            <h2 className="text-xl font-semibold text-slate-950">Manual Metric Overrides</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Add self-reported metrics for any platform you prefer not to connect. These values are shown with a self-reported label on your public portfolio.
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
              instagramAverageEngagementRate: creatorProfile?.instagramAverageEngagementRate ?? null,
              tiktokFollowers: creatorProfile?.tiktokFollowers ?? null,
              tiktokAverageLikes: creatorProfile?.tiktokAverageLikes ?? null,
            }}
          />
        </section>
      ) : null}
    </div>
  );
}