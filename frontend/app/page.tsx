"use client";

import { useState } from "react";
import api, { API_URL } from "@/lib/api";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post(
        "/auth/login",
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

      localStorage.setItem(
        "access_token",
        response.data.access_token
      );

      localStorage.setItem(
        "refresh_token",
        response.data.refresh_token
      );

      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.detail || err?.message || "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[420px]">
        <h1 className="text-4xl font-bold text-center mb-2">
          Analytics Platform
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Multi-Tenant Analytics SaaS
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-4"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-4"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-3 rounded"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <button
          className="w-full border p-3 rounded mt-4"
          onClick={() => {
            window.location.href = `${API_URL}/auth/google/login`;
          }}
        >
          Continue with Google
        </button>

        <button
          onClick={() =>
            (window.location.href = "/signup")
          }
          className="w-full bg-green-600 text-white p-3 rounded mt-4"
        >
          Create Account
        </button>
      </div>
    </main>
  );
}