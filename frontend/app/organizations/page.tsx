"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api, { API_URL } from "@/lib/api";
import { getSelectedOrganizationId, setSelectedOrganizationId } from "@/lib/storage";
import { Organization, UserProfile } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import OrganizationSwitcher from "@/components/OrganizationSwitcher";
import LoadingSpinner from "@/components/LoadingSpinner";

type FormValues = {
  name: string;
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { name: "" },
  });

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        setLoading(true);
        const [orgsRes, userRes] = await Promise.all([
          api.get<Organization[]>("/organizations/"),
          api.get<UserProfile>("/users/me"),
        ]);

        const storedOrgId = getSelectedOrganizationId();
        const orgs = orgsRes.data ?? [];
        setOrganizations(orgs);
        setUser(userRes.data);

        if (storedOrgId) {
          setSelectedOrgId(storedOrgId);
        } else if (orgs?.[0]?.id) {
          const firstOrgId = String(orgs[0].id);
          setSelectedOrganizationId(firstOrgId);
          setSelectedOrgId(firstOrgId);
        }
      } catch (err) {
        setError("Failed to load organizations.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  async function onSubmit(values: FormValues) {
    setError("");
    const requestUrl = "/organizations/";
    const payload = { name: values.name };
    const token = localStorage.getItem("access_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    console.log("Create Organization Request URL:", `${API_URL}${requestUrl}`);
    console.log("Create Organization Request payload:", payload);
    console.log("Create Organization token present:", Boolean(token));
    console.log("Create Organization token value:", token);
    console.log("Create Organization Request Authorization header:", headers.Authorization);
    console.log("Create Organization Request headers:", headers);

    try {
      setLoading(true);
      const response = await api.post<Organization>(requestUrl, payload, {
        headers,
      });

      console.log("Create Organization Response status:", response.status);
      console.log("Create Organization Response body:", response.data);

      setOrganizations((prev) => [...prev, response.data]);
      reset();

      if (!selectedOrgId) {
        const newOrgId = String(response.data.id);
        setSelectedOrganizationId(newOrgId);
        setSelectedOrgId(newOrgId);
      }
    } catch (error) {
      console.error("Create Organization Error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseBody = error.response?.data;

        console.error("Create Organization Error response status:", status);
        console.error("Create Organization Error response body:", responseBody);

        const backendMessage =
          responseBody?.detail ||
          responseBody?.message ||
          JSON.stringify(responseBody) ||
          "Unknown error from backend.";

        setError(
          `Create organization failed. HTTP ${status ?? "unknown"}: ${backendMessage}`
        );
      } else {
        setError(`Create organization failed: ${String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <TopNav userName={user?.name ?? "User"} />
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[280px_1fr]">
          <Sidebar activePath="/organizations" />

          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Organization management</p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-900">Manage tenants</h1>
                </div>
                <p className="text-sm text-slate-600">Create and switch organizations for your account.</p>
              </div>
            </section>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Current organizations</h2>
                  <p className="mt-2 text-sm text-slate-600">Your active tenant and organization list.</p>

                  <div className="mt-6">
                    <OrganizationSwitcher
                      organizations={organizations}
                      selectedOrganizationId={selectedOrgId}
                      onSelect={(value) => {
                        setSelectedOrgId(value);
                        setSelectedOrganizationId(value);
                      }}
                    />
                  </div>

                  <div className="mt-8 space-y-3">
                    {organizations.map((organization) => (
                      <div key={organization.id} className="rounded-3xl border border-slate-200 p-4">
                        <p className="font-semibold text-slate-900">{organization.name}</p>
                        <p className="text-sm text-slate-600">Created on {new Date(organization.created_at ?? "").toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Create new organization</h2>
                  <p className="mt-2 text-sm text-slate-600">Add a new tenant for your workspace.</p>

                  <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Organization name</span>
                      <input
                        type="text"
                        {...register("name", { required: true })}
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-500"
                        placeholder="Acme Analytics"
                      />
                    </label>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    <button
                      type="submit"
                      className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Create organization
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
