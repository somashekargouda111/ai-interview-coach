import type { Star } from '../api/types';
import ScoreBadge from './ScoreBadge';

const PARTS = [
  ['situation', 'Situation'],
  ['task', 'Task'],
  ['action', 'Action'],
  ['result', 'Result'],
] as const;

export default function StarAnalysis({ star }: { star: Star }) {
  return (
    <section aria-label="STAR analysis">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold">STAR method</h4>
        <ScoreBadge score={star.starScore} size="sm" />
      </div>
      <ul className="space-y-2">
        {PARTS.map(([key, name]) => (
          <li key={key} className="flex gap-3 rounded-md bg-desk/60 px-3 py-2 text-sm">
            <span
              className={`mt-0.5 h-5 w-5 shrink-0 rounded-full text-center text-xs font-bold leading-5 text-white ${star[key].present ? 'bg-pass' : 'bg-flag'}`}
              aria-label={star[key].present ? 'Covered' : 'Missing'}
            >
              {star[key].present ? '✓' : '!'}
            </span>
            <div>
              <div className="font-medium">{name}</div>
              <p className="text-muted">{star[key].feedback}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
