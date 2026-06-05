"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const accessToken =
      params.get("access_token");

    const refreshToken =
      params.get("refresh_token");

    if (accessToken) {
      localStorage.setItem(
        "access_token",
        accessToken
      );
    }

    if (refreshToken) {
      localStorage.setItem(
        "refresh_token",
        refreshToken
      );
    }

    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Signing you in...
    </div>
  );
}