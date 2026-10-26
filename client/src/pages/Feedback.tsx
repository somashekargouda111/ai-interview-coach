import { Link, useParams } from 'react-router-dom';
import { useInterview } from '../api/hooks';
import FeedbackCard from '../components/FeedbackCard';
import ScoreBadge from '../components/ScoreBadge';
import { ErrorBox, PageTitle, sheet, Spinner } from '../components/ui';
import { errMsg, TYPE_LABELS } from '../lib/utils';

/** Full review of every question, your latest answer, and its feedback. */
export default function Feedback() {
  const { id = '' } = useParams();
  const { data: iv, isLoading, error } = useInterview(id);

  if (isLoading) return <Spinner />;
  if (error || !iv) return <ErrorBox>{errMsg(error ?? new Error('Interview not found'))}</ErrorBox>;

  return (
    <>
      <PageTitle sub={`${iv.jobRole}${iv.companyName ? ` at ${iv.companyName}` : ''}`}>Answer-by-answer feedback</PageTitle>
      <div className="space-y-4">
        {iv.questions.map((q) => {
          const a = q.latestAnswer;
          return (
            <details key={q.id} className={`${sheet} p-5`} open={iv.questions.length <= 3}>
              <summary className="flex cursor-pointer items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-muted">Question {q.order}, {TYPE_LABELS[q.type] ?? q.type}</div>
                  <div className="font-serif text-lg font-semibold">{q.text}</div>
                </div>
                {a?.feedback ? <ScoreBadge score={a.feedback.overallScore} size="sm" /> : <span className="text-sm text-muted">Skipped</span>}
              </summary>
              {a?.feedback ? (
                <div className="mt-5 space-y-5">
                  <div>
                    <h3 className="mb-1.5 font-semibold">Your answer{q.attemptCount > 1 ? ` (attempt ${a.attemptNumber} of ${q.attemptCount})` : ''}</h3>
                    <p className="whitespace-pre-wrap rounded-md bg-desk/60 p-3 text-sm">{a.answerText}</p>
                  </div>
                  <FeedbackCard feedback={a.feedback} />
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">You skipped this question, so it is not part of your score.</p>
              )}
            </details>
          );
        })}
      </div>
      <p className="mt-6"><Link to={`/interviews/${id}/summary`} className="text-sm font-medium text-pine underline">Back to summary</Link></p>
    </>
  );
}
