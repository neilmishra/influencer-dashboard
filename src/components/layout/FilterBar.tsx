"use client";

import { Camera, Music2, PlayCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { cn, getRouteContext } from "@/lib/utils";
import type { ChannelFilter, Timeframe } from "@/types/dashboard";

const channels: { id: ChannelFilter; label: string }[] = [
  { id: "all", label: "All channels" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
];

const timeframes: { id: Timeframe; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
];

function ChannelIcon({ id }: { id: ChannelFilter }) {
  if (id === "instagram") return <Camera className="h-3.5 w-3.5" />;
  if (id === "youtube") return <PlayCircle className="h-3.5 w-3.5" />;
  if (id === "tiktok") return <Music2 className="h-3.5 w-3.5" />;
  return null;
}

export function FilterBar() {
  const { channel, timeframe, setChannel, setTimeframe } = useDashboard();
  const pathname = usePathname();
  const routeContext = pathname ? getRouteContext(pathname) : "dashboard";

  if (routeContext === "default") {
    return null;
  }


  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex flex-wrap gap-2">
        {channels.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setChannel(item.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              channel === item.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            <ChannelIcon id={item.id} />
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex rounded-full bg-slate-100 p-1">
        {timeframes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTimeframe(item.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              timeframe === item.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
