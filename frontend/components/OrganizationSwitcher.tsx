import { Organization } from "@/lib/types";

export default function OrganizationSwitcher({
  organizations,
  selectedOrganizationId,
  onSelect,
}: {
  organizations: Organization[];
  selectedOrganizationId?: string | null;
  onSelect: (organizationId: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Organization</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Current tenant</h2>
        </div>
      </div>

      <select
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-500"
        value={selectedOrganizationId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="">Select an organization</option>
        {organizations.map((org) => (
          <option key={org.id} value={String(org.id)}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
}
