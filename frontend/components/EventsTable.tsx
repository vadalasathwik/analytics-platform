import { EventRecord } from "@/lib/types";

type EventsTableProps = {
  events: EventRecord[];
};

export default function EventsTable({ events }: EventsTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-3">Event</th>
            <th className="px-6 py-3">Properties</th>
            <th className="px-6 py-3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {events.map((event) => (
            <tr key={`${event.event_name}-${event.created_at}-${event.id ?? Math.random()}`}>
              <td className="px-6 py-4 font-medium text-slate-900">
                {event.event_name}
              </td>
              <td className="px-6 py-4 text-slate-600">
                <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-500">
                  {JSON.stringify(event.properties ?? {}, null, 2)}
                </pre>
              </td>
              <td className="px-6 py-4 text-slate-500">{new Date(event.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
