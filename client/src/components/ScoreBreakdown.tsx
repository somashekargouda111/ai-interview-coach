import { barColor } from './ScoreBadge';

export default function ScoreBreakdown({ items }: { items: { label: string; value: number | null | undefined }[] }) {
  return (
    <dl className="space-y-2.5">
      {items.map(({ label, value }) =>
        value == null ? null : (
          <div key={label} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-sm">
            <dt className="capitalize text-muted">{label}</dt>
            <dd className="h-2 overflow-hidden rounded-full bg-desk" role="presentation">
              <div className={`h-full rounded-full ${barColor(value)}`} style={{ width: `${value * 10}%` }} />
            </dd>
            <dd className="text-right font-medium tabular-nums">{value.toFixed(1)}</dd>
          </div>
        ),
      )}
    </dl>
  );
}
