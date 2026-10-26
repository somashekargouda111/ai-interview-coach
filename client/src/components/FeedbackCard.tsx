import type { Feedback } from '../api/types';
import ScoreBadge from './ScoreBadge';
import ScoreBreakdown from './ScoreBreakdown';
import StarAnalysis from './StarAnalysis';

function List({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="mb-1.5 font-semibold">{title}</h4>
      <ul className="space-y-1.5 text-sm">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FeedbackCard({ feedback: f }: { feedback: Feedback }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div>
          <div className="mb-1 text-sm text-muted">Overall</div>
          <ScoreBadge score={f.overallScore} size="lg" />
        </div>
        <div className="min-w-64 flex-1">
          <ScoreBreakdown
            items={[
              { label: 'relevance', value: f.scores.relevance },
              { label: 'clarity', value: f.scores.clarity },
              { label: 'structure', value: f.scores.structure },
              { label: 'specificity', value: f.scores.specificity },
              { label: 'confidence', value: f.scores.confidence },
            ]}
          />
        </div>
      </div>

      {f.starAnalysis && <StarAnalysis star={f.starAnalysis} />}

      <div className="grid gap-6 md:grid-cols-2">
        <List title="What worked" items={f.strengths} tone="bg-pass" />
        <List title="What to fix" items={f.weaknesses} tone="bg-flag" />
      </div>
      <List title="Try this next time" items={f.improvementSuggestions} tone="bg-pine" />

      {f.improvedAnswer && (
        <details className="rounded-md border border-line bg-white p-4">
          <summary className="cursor-pointer font-semibold">Suggested stronger answer</summary>
          <p className="mt-3 whitespace-pre-wrap font-serif text-[1.05rem] leading-relaxed">{f.improvedAnswer}</p>
          <p className="mt-3 text-xs text-muted">Placeholders like [X%] mark details only you can fill in. Use it as a model, not a script.</p>
        </details>
      )}
    </div>
  );
}
