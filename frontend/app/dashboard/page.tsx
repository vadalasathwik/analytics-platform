"use client";

import { useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import EventChart from "@/components/EventChart";
import ActivityChart from "@/components/ActivityChart";
import { API_URL } from "@/lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

const [organizations, setOrganizations] =
  useState<any[]>([]);

const [selectedOrg, setSelectedOrg] =
  useState("");

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/";
  }

useEffect(() => {
  async function loadDashboard() {
    console.log("NEW DASHBOARD CODE LOADED");
    try {
      const token =
        localStorage.getItem("access_token");

      if (!token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const orgRes = await fetch(`${API_URL}/organizations/`, {
        headers,
      });

      if (!orgRes.ok) {
        if (orgRes.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return;
        }
        throw new Error(`Failed to load organizations: ${orgRes.status}`);
      }

      const orgs = await orgRes.json();

      if (!orgs.length) return;

      const orgId = orgs[0].id;

      setSelectedOrg(orgId);

      const summaryRes = await fetch(
  `${API_URL}/analytics/summary`,
  { headers }
);

      if (!summaryRes.ok) {
        if (summaryRes.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return;
        }
        throw new Error(`Failed to load summary: ${summaryRes.status}`);
      }

      const topEventsRes = await fetch(
  `${API_URL}/analytics/top-events`,
  { headers }
);

      if (!topEventsRes.ok) {
        if (topEventsRes.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return;
        }
        throw new Error(`Failed to load top events: ${topEventsRes.status}`);
      }

      const recentEventsRes = await fetch(
  `${API_URL}/analytics/recent-events`,
  { headers }
);

      if (!recentEventsRes.ok) {
        if (recentEventsRes.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return;
        }
        throw new Error(`Failed to load recent events: ${recentEventsRes.status}`);
      }

      const summaryData =
        await summaryRes.json();

      const topEventsData =
        await topEventsRes.json();

      const recentEventsData =
        await recentEventsRes.json();

      setSummary(summaryData);

      setTopEvents(
        Array.isArray(topEventsData)
          ? topEventsData
          : []
      );

      setRecentEvents(
        Array.isArray(recentEventsData)
          ? recentEventsData
          : []
      );
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );
    }
  }

  loadDashboard();
}, []);
  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Dashboard...
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-gray-500">
              Total Events
            </h2>

            <p className="text-4xl font-bold mt-2">
              {summary.total_events}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-gray-500">
              API Keys
            </h2>

            <p className="text-4xl font-bold mt-2">
              {summary.total_api_keys}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-gray-500">
              Top Event
            </h2>

            <p className="text-xl font-bold mt-2">
              {topEvents?.[0]?.event_name ??
                "No Events"}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-gray-500">
              Recent Activity
            </h2>

            <p className="text-4xl font-bold mt-2">
              {recentEvents.length}
            </p>
          </div>

        </div>

        {/* CHARTS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          <EventChart
            data={topEvents}
          />

          <ActivityChart
            data={recentEvents}
          />

        </div>

        {/* TOP EVENTS */}

        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Top Events
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">
                  Event Name
                </th>

                <th className="text-left py-3">
                  Count
                </th>
              </tr>
            </thead>

            <tbody>
              {topEvents.length > 0 ? (
                topEvents.map(
                  (event, index) => (
                    <tr
                      key={index}
                      className="border-b"
                    >
                      <td className="py-3">
                        {event.event_name}
                      </td>

                      <td className="py-3">
                        {event.count}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="py-4 text-center"
                  >
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RECENT EVENTS */}

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">
            Recent Events
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">
                  Event
                </th>

                <th className="text-left py-3">
                  User
                </th>

                <th className="text-left py-3">
                  Created At
                </th>
              </tr>
            </thead>

            <tbody>
              {recentEvents.length > 0 ? (
                recentEvents.map(
                  (event) => (
                    <tr
                      key={event.id}
                      className="border-b"
                    >
                      <td className="py-3">
                        {event.event_name}
                      </td>

                      <td className="py-3">
                        {event.user_id}
                      </td>

                      <td className="py-3">
                        {new Date(
                          event.created_at
                        ).toLocaleString()}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="py-4 text-center"
                  >
                    No recent events
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </main>
    </AuthGuard>
  );
}