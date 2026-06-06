"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { UserProfile } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import LoadingSpinner from "@/components/LoadingSpinner";
import { clearAuthTokens, clearSelectedOrganizationId } from "@/lib/storage";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const response = await api.get<UserProfile>("/users/me");
        setUser(response.data);
      } catch (err) {
        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleLogout() {
    clearAuthTokens();
    clearSelectedOrganizationId();
    router.push("/login");
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <TopNav userName={user?.name ?? "User"} />
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[280px_1fr]">
          <Sidebar activePath="/profile" />

          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile</p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-900">Account details</h1>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-3xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </section>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Name</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Email</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{user?.email}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Joined</p>
                    <p className="mt-2 text-lg text-slate-900">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Current organization</p>
                    <p className="mt-2 text-lg text-slate-900">Use organization switcher page to change tenant.</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
