import SummaryCards from "@/components/SummaryCards"
import RevenueChart from "@/components/RevenueChart"
import GrowthChart from "@/components/GrowthChart"
import ActivityFeed from "@/components/ActivityFeed"

async function getDashboardData() {
  const res = await fetch(
    "http://127.0.0.1:8000/analytics/dashboard",
    {
      cache: "no-store",
    }
  )

  return res.json()
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">
        Analytics Dashboard
      </h1>

      <SummaryCards summary={data.summary} />

      <div className="grid grid-cols-2 gap-6 mb-6">
        <RevenueChart data={data.revenue} />
        <GrowthChart data={data.growth} />
      </div>

      <ActivityFeed activity={data.activity} />
    </main>
  )
}