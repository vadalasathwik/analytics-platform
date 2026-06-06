"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import GoogleButton from "@/components/GoogleButton";
import { setAuthTokens } from "@/lib/storage";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<LoginForm>();

  async function onSubmit(values: LoginForm) {
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", values.email);
      formData.append("password", values.password);

      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("Login response access_token:", response.data.access_token);
      console.log("Login response refresh_token:", response.data.refresh_token);
      setAuthTokens(response.data.access_token, response.data.refresh_token);
      console.log("Login stored access_token in localStorage.");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-md space-y-8 rounded-[2.5rem] border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/40">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold">Login</h1>
          <p className="text-slate-400">Access your analytics workspace and continue where you left off.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              {...register("email", { required: true })}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Password
            <input
              type="password"
              {...register("password", { required: true })}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            />
          </label>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <GoogleButton className="mt-2" />

        <p className="text-center text-sm text-slate-400">
          New here? <a href="/signup" className="font-semibold text-slate-100 hover:text-white">Create an account</a>
        </p>
      </div>
    </div>
  );
}
