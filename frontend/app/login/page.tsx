"use client";

import { useState } from "react";
import api, { API_URL } from "@/lib/api";

export default function LoginPage() {
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
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Login</h1>

      <input
        className="border p-2 block mt-4"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 block mt-4"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <div className="text-red-600 mb-2">{error}</div>
      )}

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 mt-4"
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
    </div>
  );
}
