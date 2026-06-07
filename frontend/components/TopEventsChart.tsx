"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TopEvent } from "@/lib/types";

type TopEventsChartProps = {
  data: TopEvent[];
};

export default function TopEventsChart({ data }: TopEventsChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Top Events</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Event volume</h2>
        </div>
      </div>
      <div className="h-80">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 6)}>
              <XAxis dataKey="event_name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0f172a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
