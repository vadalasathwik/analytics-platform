type Props = {
  summary: {
    total_users: number
    total_organizations: number
    total_memberships: number
  }
}

export default function SummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-gray-500">Users</h3>
        <p className="text-3xl font-bold">
          {summary.total_users}
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-gray-500">Organizations</h3>
        <p className="text-3xl font-bold">
          {summary.total_organizations}
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-gray-500">Memberships</h3>
        <p className="text-3xl font-bold">
          {summary.total_memberships}
        </p>
      </div>
    </div>
  )
}