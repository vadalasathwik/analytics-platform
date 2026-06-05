"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

async function handleLogin() {
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

    alert("Login successful");

    window.location.href = "/dashboard";

  } catch (error) {
    console.error(error);
    alert("Login failed");
  }
}

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Login
      </h1>

      <input
        className="border p-2 block mt-4"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        className="border p-2 block mt-4"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 mt-4"
      >
        Login
      </button>
    </div>
  );
}