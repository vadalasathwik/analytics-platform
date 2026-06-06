"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import api from "@/lib/api";

type SignupForm = {
  name: string;
  email: string;
  password: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<SignupForm>();

  async function onSubmit(values: SignupForm) {
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", values);
      router.push("/login");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-md space-y-8 rounded-[2.5rem] border border-slate-800 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/40">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold">Sign Up</h1>
          <p className="text-slate-400">Create an account and start tracking analytics for your organization.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm text-slate-300">
            Name
            <input
              type="text"
              {...register("name", { required: true })}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            />
          </label>

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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Already have an account? <a href="/login" className="font-semibold text-slate-100 hover:text-white">Login</a>
        </p>
      </div>
    </div>
  );
}
