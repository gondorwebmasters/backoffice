export function KpiCard({
  label,
  value,
  detail,
  loading,
}: {
  label: string;
  value: number | string;
  detail?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</p>
      {loading ? (
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-zinc-100" />
      ) : (
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-zinc-900">{value}</p>
      )}
      {detail ? <p className="mt-1 text-xs text-zinc-400">{detail}</p> : null}
    </div>
  );
}
