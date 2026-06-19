type StatCardProps = {
  label: string;
  value: string;
  trend: string;
};

export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <article className="rounded-md border border-line bg-white p-4 shadow-soft">
      <p className="text-sm text-ink/60">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <strong className="text-3xl font-semibold text-steel">{value}</strong>
        <span className="rounded-md bg-wheat px-2.5 py-1 text-xs font-medium text-ink/75">
          {trend}
        </span>
      </div>
    </article>
  );
}
