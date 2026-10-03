"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Camera, LoaderCircle, Music2, Play } from "lucide-react";

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
  const [connectingProvider, setConnectingProvider] = useState<SocialProvider | null>(null);
  const [connectionError, setConnectionError] = useState<{ provider: SocialProvider; message: string } | null>(null);

  async function handleConnect(provider: SocialProvider, isConfigured: boolean) {
    setConnectionError(null);
    if (!isConfigured) {
      setConnectionError({
        provider,
        message: "This provider is not configured yet. Add its client ID and secret to the server environment, then restart the app.",
      });
      return;
    }

    setConnectingProvider(provider);
    try {
      const result = await signIn(provider, { callbackUrl: "/settings", redirect: false });
      if (result?.error || !result?.url) {
        setConnectionError({
          provider,
          message: "Could not start the connection. Check the provider configuration and try again.",
        });
        setConnectingProvider(null);
        return;
      }
      window.location.assign(result.url);
    } catch {
      setConnectionError({
        provider,
        message: "Could not reach the authentication service. Try again.",
      });
      setConnectingProvider(null);
    }
  }

  return (
    <section aria-label="Social data connections" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {connections.map(({ id, name, buttonLabel, Icon, color }) => {
        const isConnected = connected[id];
        const isConfigured = configured[id];
        const isConnecting = connectingProvider === id;

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
                  ? "An account is linked. Reconnect any time to refresh permissions or repair access."
                  : "Authorize access to make this platform available for data sync."}
              </p>
            </div>

            <button
              type="button"
              disabled={isConnecting}
              aria-busy={isConnecting}
              onClick={() => void handleConnect(id, isConfigured)}
              className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-wait disabled:bg-slate-50 disabled:text-slate-500"
            >
              {isConnecting ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
              {isConnecting ? `Connecting ${name}...` : isConnected ? `Reconnect ${name}` : buttonLabel}
            </button>
            {!isConfigured ? (
              <p className="mt-2 text-xs text-slate-500">
                Provider credentials are not detected by the server.
              </p>
            ) : null}
            {connectionError?.provider === id ? (
              <p role="alert" className="mt-2 text-xs leading-5 text-rose-700">{connectionError.message}</p>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}