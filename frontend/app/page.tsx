import Link from "next/link";

const features = [
  {
    title: "Tenant-first analytics",
    description: "Support multi-organization workflows with isolated dashboards and membership controls.",
  },
  {
    title: "Fast event tracking",
    description: "Send events with API keys and analyze activity using real-time charts and tables.",
  },
  {
    title: "Google sign-in",
    description: "Secure OAuth login for fast onboarding and enterprise-ready authentication.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section className="space-y-8">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Analytics SaaS</p>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">Measure growth across organizations with a single analytics cockpit.</h1>
              <p className="mt-6 text-lg leading-8 text-slate-300">Build customer insights, manage API access, and review events in one modern multi-tenant dashboard.</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/login" className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-sky-400">
                Login
              </Link>
              <Link href="/signup" className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white/10 px-6 py-4 text-sm font-semibold text-slate-100 transition hover:bg-white/20">
                Sign Up
              </Link>
            </div>
          </section>

          <section className="rounded-[3rem] border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/40">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Product features</p>
                <h2 className="text-3xl font-semibold text-white">Everything teams need to ship analytics fast.</h2>
              </div>

              <div className="grid gap-4">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-slate-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
