"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthTokens, clearSelectedOrganizationId } from "@/lib/storage";

type TopNavProps = {
  userName: string;
};

export default function TopNav({ userName }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    clearAuthTokens();
    clearSelectedOrganizationId();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
            Analytics Platform
          </Link>
          <nav className="hidden items-center gap-3 md:flex">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Events", href: "/event-explorer" },
              { label: "Orgs", href: "/organizations" },
              { label: "API Keys", href: "/api-keys" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm transition ${
                  pathname === item.href
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-600">Signed in as {userName}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
