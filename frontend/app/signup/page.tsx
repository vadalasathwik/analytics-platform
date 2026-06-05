"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful");

      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Sign Up
      </h1>

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
      >
        Sign Up
      </button>
    </div>
  );
}