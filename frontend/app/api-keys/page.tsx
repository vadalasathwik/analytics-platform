"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { ApiKey, UserProfile } from "@/lib/types";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ApiKeyTable from "@/components/ApiKeyTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getSelectedOrganizationId } from "@/lib/storage";

type FormValues = {
  name: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { name: "" },
  });

  useEffect(() => {
    async function fetchKeys() {
      const orgId = getSelectedOrganizationId();
      setSelectedOrgId(orgId);

      if (!orgId) {
        setError("Select an organization from the Organizations page before managing API keys.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [keysRes, userRes] = await Promise.all([
          api.get<ApiKey[]>("/api-keys/", {
            params: { organization_id: orgId },
          }),
          api.get<UserProfile>("/users/me"),
        ]);

        setKeys(keysRes.data ?? []);
        setUser(userRes.data);
      } catch (err) {
        setError("Unable to load API keys.");
      } finally {
        setLoading(false);
      }
    }

    fetchKeys();
  }, []);

  async function onSubmit(values: FormValues) {
      const orgId = getSelectedOrganizationId();
      if (!orgId) {
        setError("Select an organization from the Organizations page before generating API keys.");
        return;
      }

      try {
        setLoading(true);
        const response = await api.post<ApiKey>("/api-keys/generate", {
          name: values.name,
        }, {
          params: { organization_id: orgId },
        });

        setKeys((current) => [response.data, ...current]);
        reset();
      } catch (err) {
        setError("Unable to generate key.");
      } finally {
        setLoading(false);
      }
  }

  async function handleCopy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(""), 1800);
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <TopNav userName={user?.name ?? "User"} />
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 xl:grid-cols-[280px_1fr]">
          <Sidebar activePath="/api-keys" />

          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">API key management</p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-900">Secure programmatic access</h1>
                </div>
                <p className="text-sm text-slate-600">Create API keys and copy them securely.</p>
              </div>
            </section>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Your API keys</h2>
                  <p className="mt-2 text-sm text-slate-600">Stored keys are shown below. Copy values when you need to use them in your integrations.</p>

                  <div className="mt-6">
                    <ApiKeyTable keys={keys} onCopy={handleCopy} />
                  </div>

                  {copied ? (
                    <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      Copied key to clipboard.
                    </div>
                  ) : null}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Generate API key</h2>
                  <p className="mt-2 text-sm text-slate-600">Create a key to authenticate event and analytics requests.</p>

                  <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">Key name</span>
                      <input
                        type="text"
                        {...register("name", { required: true })}
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-500"
                        placeholder="Mobile app key"
                      />
                    </label>
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    <button
                      type="submit"
                      className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Generate key
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
