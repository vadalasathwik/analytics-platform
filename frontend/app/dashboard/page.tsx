"use client";

import { useEffect, useState } from "react";

import AuthGuard from "@/components/AuthGuard";
import EventChart from "@/components/EventChart";
import ActivityChart from "@/components/ActivityChart";
import { API_URL } from "@/lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>({
    total_events: 0,
    total_api_keys: 0,
  });
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");

  const [loadingState, setLoadingState] = useState<"idle" | "loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/";
  }

  useEffect(() => {
    async function loadDashboard() {
      console.log("NEW DASHBOARD CODE LOADED");
      setLoadingState("loading");
      setErrorMessage("");

      try {
        const token = localStorage.getItem("access_token");
        console.log("access_token exists:", !!token);

        if (!token) {
          setErrorMessage("No access_token found. Please login.");
          setLoadingState("error");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // ORGANIZATIONS
        const orgUrl = `${API_URL}/organizations/`;
        console.log("Requesting organizations ->", orgUrl);
        let orgRes: Response;
        try {
          orgRes = await fetch(orgUrl, { headers });
          console.log("organizations status:", orgRes.status);
        } catch (err) {
          console.error("organizations fetch error:", err);
          setErrorMessage("organization fetch failed: network error");
          setLoadingState("error");
          return;
        }

        let orgs: any[] = [];
        try {
          const orgText = await orgRes.text();
          console.log("organizations response body:", orgText);
          orgs = orgText ? JSON.parse(orgText) : [];
        } catch (err) {
          console.error("organizations JSON parse error:", err);
          setErrorMessage("organization fetch failed: invalid JSON");
          setLoadingState("error");
          return;
        }

        if (!Array.isArray(orgs) || orgs.length === 0) {
          setOrganizations([]);
          setErrorMessage("No organizations found");
          setLoadingState("error");
          return;
        }

        setOrganizations(orgs);
        const orgId = orgs[0].id;
        setSelectedOrg(orgId);

        // SUMMARY
        const summaryUrl = `${API_URL}/analytics/summary?organization_id=${orgId}`;
        console.log("Requesting summary ->", summaryUrl);
        let summaryRes: Response;
        try {
          summaryRes = await fetch(summaryUrl, { headers });
          console.log("summary status:", summaryRes.status);
        } catch (err) {
          console.error("summary fetch error:", err);
          setErrorMessage("summary fetch failed: network error");
          setLoadingState("error");
          return;
        }

        let summaryData: any = null;
        try {
          const summaryText = await summaryRes.text();
          console.log("summary response body:", summaryText);
          summaryData = summaryText ? JSON.parse(summaryText) : null;
        } catch (err) {
          console.error("summary JSON parse error:", err);
          setErrorMessage("summary fetch failed: invalid JSON");
          setLoadingState("error");
          return;
        }

        // TOP EVENTS
        const topUrl = `${API_URL}/analytics/top-events?organization_id=${orgId}`;
        console.log("Requesting top-events ->", topUrl);
        let topRes: Response;
        try {
          topRes = await fetch(topUrl, { headers });
          console.log("top-events status:", topRes.status);
        } catch (err) {
          console.error("top-events fetch error:", err);
          setErrorMessage("top-events fetch failed: network error");
          setLoadingState("error");
          return;
        }

        let topEventsData: any[] = [];
        try {
          const topText = await topRes.text();
          console.log("top-events response body:", topText);
          topEventsData = topText ? JSON.parse(topText) : [];
        } catch (err) {
          console.error("top-events JSON parse error:", err);
          setErrorMessage("top-events fetch failed: invalid JSON");
          setLoadingState("error");
          return;
        }

        // RECENT EVENTS
        const recentUrl = `${API_URL}/analytics/recent-events?organization_id=${orgId}`;
        console.log("Requesting recent-events ->", recentUrl);
        let recentRes: Response;
        try {
          recentRes = await fetch(recentUrl, { headers });
          console.log("recent-events status:", recentRes.status);
        } catch (err) {
          console.error("recent-events fetch error:", err);
          setErrorMessage("recent-events fetch failed: network error");
          setLoadingState("error");
          return;
        }

        let recentEventsData: any[] = [];
        try {
          const recentText = await recentRes.text();
          console.log("recent-events response body:", recentText);
          recentEventsData = recentText ? JSON.parse(recentText) : [];
        } catch (err) {
          console.error("recent-events JSON parse error:", err);
          setErrorMessage("recent-events fetch failed: invalid JSON");
          setLoadingState("error");
          return;
        }

        // set states
        setSummary(summaryData);
        setTopEvents(Array.isArray(topEventsData) ? topEventsData : []);
        setRecentEvents(Array.isArray(recentEventsData) ? recentEventsData : []);

        console.log("summaryData:", summaryData);
        console.log("topEventsData count:", Array.isArray(topEventsData) ? topEventsData.length : 0);
        console.log("recentEventsData count:", Array.isArray(recentEventsData) ? recentEventsData.length : 0);

        setLoadingState("success");
      } catch (err) {
        console.error("Unexpected dashboard error:", err);
        setErrorMessage("Unexpected error loading dashboard");
        setLoadingState("error");
      }
    }

    loadDashboard();
  }, []);
  if (loadingState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Dashboard...
      </div>
    );
  }

  if (loadingState === "error") {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Dashboard Error</h2>
          <p className="text-red-600 mb-4">{errorMessage || "Failed to load dashboard."}</p>
          <div className="text-sm text-gray-700 mb-2">
            <strong>Selected org:</strong> {selectedOrg || "(none)"}
          </div>
          <div className="text-sm text-gray-700">
            <strong>Orgs count:</strong> {organizations?.length ?? 0}
          </div>
        </div>
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
              {summary?.total_events ?? 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-gray-500">
              API Keys
            </h2>

            <p className="text-4xl font-bold mt-2">
              {summary?.total_api_keys ?? 0}
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