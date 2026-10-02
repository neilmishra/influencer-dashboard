"use client";

import { signIn } from "next-auth/react";
import { Camera, Music2, Play } from "lucide-react";

export type SocialProvider = "google" | "facebook" | "tiktok";

interface ConnectionGridProps {
  connected: Record<SocialProvider, boolean>;
  configured: Record<SocialProvider, boolean>;
}

const connections = [
  {
    id: "google",
    name: "YouTube",
    buttonLabel: "Connect YouTube Channel",
    Icon: Play,
    color: "text-red-600",
  },
  {
    id: "facebook",
    name: "Meta (Instagram)",
    buttonLabel: "Connect Meta (Instagram)",
    Icon: Camera,
    color: "text-fuchsia-600",
  },
  {
    id: "tiktok",
    name: "TikTok",
    buttonLabel: "Connect TikTok Account",
    Icon: Music2,
    color: "text-slate-950",
  },
] as const;

export function ConnectionGrid({ connected, configured }: ConnectionGridProps) {
  return (
    <section aria-label="Social data connections" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {connections.map(({ id, name, buttonLabel, Icon, color }) => {
        const isConnected = connected[id];
        const isConfigured = configured[id];

        return (
          <article key={id} className="flex min-h-64 flex-col border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50">
                <Icon aria-hidden="true" className={`h-5 w-5 ${color}`} />
              </div>
              <span
                className={`inline-flex min-h-7 items-center gap-1.5 px-2.5 text-xs font-medium ${
                  isConnected
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-400"}`}
                />
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="mt-5 flex-1">
              <h2 className="text-base font-semibold text-slate-950">{name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {isConnected
                  ? "An account is linked and its OAuth token is available."
                  : "Authorize access to make this platform available for data sync."}
              </p>
            </div>

            <button
              type="button"
              disabled={!isConfigured}
              onClick={() => signIn(id, { callbackUrl: "/settings" })}
              className="mt-5 flex min-h-11 w-full items-center justify-center border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
            >
              {isConnected ? `Reconnect ${name}` : buttonLabel}
            </button>
            {!isConfigured ? (
              <p className="mt-2 text-xs text-slate-500">
                Add this provider&apos;s client credentials to the root .env to enable connection.
              </p>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}