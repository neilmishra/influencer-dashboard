"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChannelFilter, TimeSeriesData } from "@/types/dashboard";
import { formatNumber, formatShortDate } from "@/lib/utils";

export function FollowerGrowthChart({
  data,
  channel,
}: {
  data: TimeSeriesData[];
  channel: ChannelFilter;
}) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatShortDate(point.date),
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} minTickGap={24} />
          <YAxis
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickFormatter={(value) => formatNumber(Number(value), { compact: true })}
          />
          <Tooltip
            formatter={(value) => formatNumber(Number(value), { compact: true })}
          />
          <Legend />
          {(channel === "all" || channel === "instagram") && (
            <Line
              type="monotone"
              dataKey="instagram"
              name="Instagram"
              stroke="#e1306c"
              strokeWidth={2}
              dot={false}
            />
          )}
          {(channel === "all" || channel === "youtube") && (
            <Line
              type="monotone"
              dataKey="youtube"
              name="YouTube"
              stroke="#ff0000"
              strokeWidth={2}
              dot={false}
            />
          )}
          {(channel === "all" || channel === "tiktok") && (
            <Line
              type="monotone"
              dataKey="tiktok"
              name="TikTok"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
