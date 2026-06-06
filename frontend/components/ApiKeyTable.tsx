import { ApiKey } from "@/lib/types";

type ApiKeyTableProps = {
  keys: ApiKey[];
  onCopy: (value: string) => void;
};

export default function ApiKeyTable({ keys, onCopy }: ApiKeyTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">API Key</th>
            <th className="px-6 py-3">Created</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {keys.map((key) => (
            <tr key={key.id}>
              <td className="px-6 py-4 font-medium text-slate-900">{key.name}</td>
              <td className="px-6 py-4 text-slate-600">
                <div className="max-w-xs truncate text-xs">{key.key ?? "••••••••••••"}</div>
              </td>
              <td className="px-6 py-4 text-slate-500">{new Date(key.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                {key.key ? (
                  <button
                    type="button"
                    onClick={() => onCopy(key.key ?? "")}
                    className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Copy
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Generated on create</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
