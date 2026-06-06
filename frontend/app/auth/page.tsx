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

    console.log("OAuth callback: access_token query value:", accessToken);
    console.log("OAuth callback: refresh_token query value:", refreshToken);

    if (accessToken) {
      localStorage.setItem(
        "access_token",
        accessToken
      );
      console.log("OAuth callback: stored access_token in localStorage.");
    }

    if (refreshToken) {
      localStorage.setItem(
        "refresh_token",
        refreshToken
      );
      console.log("OAuth callback: stored refresh_token in localStorage.");
    }

    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Signing you in...
    </div>
  );
}