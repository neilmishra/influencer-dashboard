"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PlatformShare } from "@/types/dashboard";
import { formatNumber } from "@/lib/utils";

const COLORS: Record<string, string> = {
  instagram: "#e1306c",
  youtube: "#ff0000",
  tiktok: "#0f172a",
};

const LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
};

export function PlatformDonutChart({ data }: { data: PlatformShare[] }) {
  const chartData = data
    .filter((item) => item.impressions > 0)
    .map((item) => ({
      name: LABELS[item.platform],
      value: item.impressions,
      platform: item.platform,
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.platform} fill={COLORS[entry.platform]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatNumber(Number(value), { compact: true })}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Impressions</p>
          <p className="text-xl font-semibold text-slate-900">
            {formatNumber(total, { compact: true })}
          </p>
        </div>
      </div>
      <ul className="mt-2 space-y-2">
        {chartData.map((item) => (
          <li key={item.platform} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: COLORS[item.platform] }}
              />
              {item.name}
            </span>
            <span className="font-medium text-slate-900">
              {total ? `${((item.value / total) * 100).toFixed(1)}%` : "0%"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
