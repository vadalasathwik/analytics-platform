import Link from "next/link";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Event Explorer", href: "/event-explorer" },
  { label: "Organizations", href: "/organizations" },
  { label: "API Keys", href: "/api-keys" },
  { label: "Profile", href: "/profile" },
];

type SidebarProps = {
  activePath: string;
};

export default function Sidebar({ activePath }: SidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 border-r border-slate-200 bg-white p-6 lg:flex">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Workspace</p>
        <p className="mt-3 text-2xl font-semibold text-slate-900">Analytics Hub</p>
      </div>

      <nav className="mt-10 flex flex-col gap-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
              activePath === link.href
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
