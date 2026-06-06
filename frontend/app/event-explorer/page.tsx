"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { EventRecord, UserProfile } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import EventsTable from "@/components/EventsTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getSelectedOrganizationId } from "@/lib/storage";

export default function EventExplorerPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 8;

  useEffect(() => {
    async function loadEvents() {
      const orgId = getSelectedOrganizationId();
      setSelectedOrgId(orgId);

      if (!orgId) {
        setError("Select an organization from the Organizations page before browsing events.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [eventsRes, userRes] = await Promise.all([
          api.get<EventRecord[]>("/analytics/recent-events", {
            params: { organization_id: orgId },
          }),
          api.get<UserProfile>("/users/me"),
        ]);

        setEvents(eventsRes.data ?? []);
        setUser(userRes.data);
      } catch (err) {
        setError("Unable to load events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const eventNames = useMemo(() => {
    return Array.from(new Set(events.map((event) => event.event_name))).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery = query
        ? event.event_name.toLowerCase().includes(query.toLowerCase()) ||
          JSON.stringify(event.properties ?? {}).toLowerCase().includes(query.toLowerCase())
        : true;

      const matchesFilter = filter === "all" ? true : event.event_name === filter;
      return matchesQuery && matchesFilter;
    });
  }, [events, query, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const pagedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <TopNav userName={user?.name ?? "User"} />
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[280px_1fr]">
          <Sidebar activePath="/event-explorer" />

          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Event explorer</p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-900">Track event usage</h1>
                </div>
                <p className="text-sm text-slate-600">Search, filter, and page through your recent events.</p>
              </div>
            </section>

            <div className="grid gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Search</span>
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Find event name or property"
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Filter by event</span>
                    <select
                      value={filter}
                      onChange={(event) => {
                        setFilter(event.target.value);
                        setPage(1);
                      }}
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="all">All event types</option>
                      {eventNames.map((eventName) => (
                        <option key={eventName} value={eventName}>{eventName}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Showing {filteredEvents.length} events</p>
                      <h2 className="text-xl font-semibold text-slate-900">Event results</h2>
                    </div>
                    <p className="text-sm text-slate-500">Page {page} of {pageCount}</p>
                  </div>

                  <EventsTable events={pagedEvents} />

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page === pageCount}
                      onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                      className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
