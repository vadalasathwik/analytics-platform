"use client";

import { useEffect, useState } from "react";

import SummaryCards from "@/components/SummaryCards";
import RevenueChart from "@/components/RevenueChart";
import GrowthChart from "@/components/GrowthChart";
import ActivityFeed from "@/components/ActivityFeed";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/login";
  }

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/analytics/dashboard",
          {
            cache: "no-store",
          }
        );

        const json = await res.json();

        setData(json);
      } catch (error) {
        console.error("Dashboard fetch failed:", error);
      }
    }

    loadData();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            Analytics Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <SummaryCards summary={data.summary} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <RevenueChart data={data.revenue} />
          <GrowthChart data={data.growth} />
        </div>

        <ActivityFeed activity={data.activity} />
      </main>
    </AuthGuard>
  );
}