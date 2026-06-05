export default function ActivityFeed({
  activity,
}: {
  activity: any[]
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        Recent Activity
      </h2>

      {activity.map((item, index) => (
        <div
          key={index}
          className="border-b py-2"
        >
          <p>{item.message}</p>
          <small>{item.time}</small>
        </div>
      ))}
    </div>
  )
}