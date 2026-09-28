"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlatformDemographics } from "@/types/dashboard";
import { formatPercent } from "@/lib/utils";

export function DemographicsBarChart({ data }: { data: PlatformDemographics }) {
  const chartData = data.age.map((bucket) => ({
    range: bucket.range,
    percent: Number(bucket.percent.toFixed(1)),
  }));

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="range" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip formatter={(value) => formatPercent(Number(value), { alreadyPercent: true })} />
            <Bar dataKey="percent" name="Audience share" fill="#7c3aed" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Female</p>
          <p className="font-semibold text-slate-900">
            {formatPercent(data.gender.female, { alreadyPercent: true, digits: 0 })}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Male</p>
          <p className="font-semibold text-slate-900">
            {formatPercent(data.gender.male, { alreadyPercent: true, digits: 0 })}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Other</p>
          <p className="font-semibold text-slate-900">
            {formatPercent(data.gender.other, { alreadyPercent: true, digits: 0 })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.topCountries.map((country) => (
          <span
            key={country.country}
            className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
          >
            {country.country} {country.percent.toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}
