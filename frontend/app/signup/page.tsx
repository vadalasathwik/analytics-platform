"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup() {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful");

      window.location.href = "/login";
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.detail || err?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Sign Up
      </h1>

      {error && (
        <div className="text-red-600 mt-4">{error}</div>
      )}

      <input
        className="border p-2 block mt-4"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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

      <button
        onClick={handleSignup}
        className="bg-green-600 text-white px-4 py-2 mt-4"
        disabled={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </div>
  );
}
