type StatCardProps = {
  label: string;
  value: number | string;
  helpText?: string;
};

export default function StatCard({
  label,
  value,
  helpText,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-4 text-4xl font-semibold text-slate-900">{value}</p>
      {helpText ? (
        <p className="mt-2 text-sm text-slate-500">{helpText}</p>
      ) : null}
    </div>
  );
}
