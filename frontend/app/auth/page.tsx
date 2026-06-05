"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit() {
    try {
      if (isLogin) {
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
      } else {
        await api.post("/auth/register", {
          name,
          email,
          password,
        });

        alert("Account created");

        setIsLogin(true);
      }
    } catch (error) {
      console.error(error);
      alert("Authentication failed");
    }
  }

  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-[400px]">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Create Account"}
        </h1>

        {!isLogin && (
          <input
            className="border p-2 w-full mb-4"
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        )}

        <input
          className="border p-2 w-full mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <button
          className="w-full border p-3 rounded mt-4"
          onClick={() =>
            alert(
              "Google OAuth will be implemented next"
            )
          }
        >
          Continue with Google
        </button>

        <p className="mt-4 text-center">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            className="ml-2 text-blue-600"
            onClick={() =>
              setIsLogin(!isLogin)
            }
          >
            {isLogin
              ? "Sign Up"
              : "Login"}
          </button>
        </p>
      </div>
    </main>
  );
}