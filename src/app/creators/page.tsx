import Image from "next/image";
import { unstable_rethrow } from "next/navigation";
import { AddCreatorModal } from "@/components/creator/AddCreatorModal";
import type { Creator } from "@/types";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const followerFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function isCreator(value: unknown): value is Creator {
  if (typeof value !== "object" || value === null) return false;

  const creator = value as Record<string, unknown>;
  return (
    typeof creator.id === "string" &&
    typeof creator.name === "string" &&
    typeof creator.handle === "string" &&
    typeof creator.avatar === "string" &&
    typeof creator.followers === "number" &&
    Number.isFinite(creator.followers) &&
    typeof creator.engagementRate === "number" &&
    Number.isFinite(creator.engagementRate) &&
    typeof creator.category === "string"
  );
}

async function getCreators(): Promise<{ creators: Creator[]; error: boolean }> {
  try {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/creators`, {
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Creator API returned ${response.status}`);

    const result: unknown = await response.json();
    if (!Array.isArray(result) || !result.every(isCreator)) {
      throw new Error("Creator API returned an invalid response.");
    }

    return { creators: result, error: false };
  } catch (error) {
    unstable_rethrow(error);
    console.error("Unable to fetch creators:", error);
    return { creators: [], error: true };
  }
}

export default async function CreatorsPage() {
  const { creators, error } = await getCreators();

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-8rem)] bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:-mx-8 lg:px-8 lg:py-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
              Creator network
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Creators</h1>
            <p className="mt-1 text-sm text-slate-400">
              {error
                ? "Creator data is temporarily unavailable."
                : `${creators.length} creator${creators.length === 1 ? "" : "s"} in your roster`}
            </p>
          </div>
          <AddCreatorModal />
        </header>

        {error ? (
          <div
            role="alert"
            className="border border-rose-900/70 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"
          >
            Could not load creators from the API. Check that the local server is running and try
            refreshing the page.
          </div>
        ) : creators.length === 0 ? (
          <div className="border border-dashed border-slate-700 px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-200">Your roster is empty</p>
            <p className="mt-1 text-sm text-slate-500">
              Add a creator to start building your network.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {creators.map((creator) => (
              <li
                key={creator.id}
                className="border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={creator.avatar}
                    alt=""
                    width={52}
                    height={52}
                    className="h-[52px] w-[52px] rounded-full border border-slate-700 object-cover"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-white">{creator.name}</h2>
                    <p className="truncate text-sm text-slate-400">{creator.handle}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="border border-slate-700 px-2.5 py-1 text-xs font-medium text-cyan-200">
                    {creator.category}
                  </span>
                  <div className="flex gap-5 text-right">
                    <div>
                      <p className="text-xs text-slate-500">Followers</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-100">
                        {followerFormatter.format(creator.followers)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Engagement</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-100">
                        {creator.engagementRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
