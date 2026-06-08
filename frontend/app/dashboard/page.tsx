"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AnalyticsSummary, EventRecord, TopEvent, UserProfile } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import StatCard from "@/components/StatCard";
import TopEventsChart from "@/components/TopEventsChart";
import EventsTable from "@/components/EventsTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getSelectedOrganizationId } from "@/lib/storage";

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<EventRecord[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const orgId = getSelectedOrganizationId();
      setSelectedOrgId(orgId);

      if (!orgId) {
        setError("Select an organization from the Organizations page before using dashboard.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [summaryRes, topEventsRes, recentEventsRes, userRes] = await Promise.all([
          api.get<AnalyticsSummary>("/analytics/summary", {
            params: { organization_id: orgId },
          }),
          api.get<TopEvent[]>("/analytics/top-events", {
            params: { organization_id: orgId },
          }),
          api.get<{ items: EventRecord[]; total: number }>("/analytics/recent-events", {
            params: { organization_id: orgId },
          }),
          api.get<UserProfile>("/users/me"),
        ]);

        console.log("SUMMARY RESPONSE", summaryRes.data);
        console.log("TOP EVENTS RESPONSE", topEventsRes.data);
        console.log("RECENT EVENTS RESPONSE", recentEventsRes.data);

        setSummary(summaryRes.data);

        setTopEvents(topEventsRes.data ?? []);
        setRecentEvents(recentEventsRes.data.items ?? []);
        setUser(userRes.data);
      } catch (err) {
        setError("Unable to load dashboard. Please refresh or log in again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);


  
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <TopNav userName={user?.name ?? "User"} />
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[280px_1fr]">
          <Sidebar activePath="/dashboard" />

          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-900">Live analytics snapshot</h1>
                </div>
                <p className="text-sm text-slate-600">Insights refresh automatically when you load the page.</p>
              </div>
            </section>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-3">
                  <StatCard label="Active users" value={summary?.total_users ?? 0} helpText="Users across all organizations" />
                  <StatCard label="Organizations" value={summary?.total_organizations ?? 0} helpText="Connected tenants" />
                  <StatCard label="Memberships" value={summary?.total_memberships ?? 0} helpText="Team memberships tracked" />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                  <TopEventsChart data={topEvents} />

                  <div className="grid gap-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="text-xl font-semibold text-slate-900">Recent events</h2>
                      <p className="mt-2 text-sm text-slate-600">A quick view of the latest tracking activity.</p>
                      <div className="mt-6">
                        <EventsTable events={recentEvents.slice(0, 5)} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
