"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ActivityChart({
  data,
}: {
  data: any[];
}) {
  const chartData = data.map(
    (event, index) => ({
      name: index + 1,
      events: index + 1,
    })
  );

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        Activity Trend
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <LineChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="events"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}