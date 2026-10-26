export const scoreColor = (s: number) => (s >= 8 ? 'text-pass' : s >= 6 ? 'text-warn' : 'text-flag');
export const barColor = (s: number) => (s >= 8 ? 'bg-pass' : s >= 6 ? 'bg-warn' : 'bg-flag');

export default function ScoreBadge({ score, size = 'md' }: { score: number | null; size?: 'sm' | 'md' | 'lg' }) {
  if (score == null) return <span className="text-sm text-muted">—</span>;
  const cls = size === 'lg' ? 'text-6xl' : size === 'md' ? 'text-3xl' : 'text-lg';
  return (
    <span className={`font-serif font-semibold leading-none ${cls} ${scoreColor(score)}`} aria-label={`Score ${score} out of 10`}>
      {score.toFixed(1)}
      <span className="ml-0.5 text-[0.4em] font-normal text-muted">/10</span>
    </span>
  );
}
