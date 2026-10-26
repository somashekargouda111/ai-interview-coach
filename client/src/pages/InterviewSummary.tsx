import { Link, useParams } from 'react-router-dom';
import { useCompleteInterview, useInterview, useSummary } from '../api/hooks';
import { ApiError } from '../api/client';
import ScoreBadge from '../components/ScoreBadge';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { btn, btnGhost, ErrorBox, PageTitle, sheet, Spinner } from '../components/ui';
import { errMsg, fmtDate, TYPE_LABELS } from '../lib/utils';

function Bullets({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className={`${sheet} p-5`}>
      <h2 className="mb-2 font-semibold">{title}</h2>
      <ul className="list-disc space-y-1.5 pl-5 text-sm">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </section>
  );
}

export default function InterviewSummary() {
  const { id = '' } = useParams();
  const iv = useInterview(id);
  const sum = useSummary(id);
  const complete = useCompleteInterview(id);

  if (iv.isLoading || sum.isLoading) return <Spinner />;
  if (iv.error || !iv.data) return <ErrorBox>{errMsg(iv.error ?? new Error('Interview not found'))}</ErrorBox>;

  const notFinished = sum.error instanceof ApiError && sum.error.status === 404;
  if (sum.error && !notFinished) return <ErrorBox>{errMsg(sum.error)}</ErrorBox>;

  if (notFinished || !sum.data) {
    return (
      <div className="mx-auto max-w-xl">
        <PageTitle sub="Finish the interview to get your overall score and a debrief.">Not finished yet</PageTitle>
        {complete.error && <div className="mb-4"><ErrorBox>{errMsg(complete.error)}</ErrorBox></div>}
        <div className="flex gap-3">
          {iv.data.status === 'in_progress' && <Link to={`/interviews/${id}/practice`} className={btnGhost}>Keep answering</Link>}
          <button className={btn} onClick={() => complete.mutate()} disabled={complete.isPending}>
            {complete.isPending ? 'Building your summary…' : 'Finish and score it'}
          </button>
        </div>
      </div>
    );
  }

  const s = sum.data.summary;
  const d = iv.data;
  return (
    <>
      <PageTitle sub={`${TYPE_LABELS[d.interviewType]} interview, ${d.completedAt ? fmtDate(d.completedAt) : ''}, ${s.answeredQuestions} of ${s.totalQuestions} questions answered`}>
        {d.jobRole}{d.companyName ? ` at ${d.companyName}` : ''}
      </PageTitle>

      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <section className={`${sheet} p-6 md:min-w-56`}>
          <div className="mb-2 text-sm text-muted">Overall score</div>
          <ScoreBadge score={s.overallScore} size="lg" />
        </section>
        <section className={`${sheet} p-6`}>
          <h2 className="mb-3 font-semibold">By category</h2>
          <ScoreBreakdown
            items={[
              { label: 'content', value: s.categoryScores.content },
              { label: 'structure', value: s.categoryScores.structure },
              { label: 'communication', value: s.categoryScores.communication },
              { label: 'technical', value: s.categoryScores.technical },
            ]}
          />
        </section>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Bullets title="Strengths" items={s.strengths} />
        <Bullets title="Weaknesses" items={s.weaknesses} />
      </div>
      <div className="mt-4"><Bullets title="What to practice next" items={s.recommendedActions} /></div>

      <section className={`${sheet} mt-4 p-5`}>
        <h2 className="mb-3 font-semibold">Question scores</h2>
        <ol className="divide-y divide-line text-sm">
          {d.questions.map((q) => (
            <li key={q.id} className="flex items-start justify-between gap-4 py-2.5">
              <span><span className="text-muted">{q.order}.</span> {q.text}</span>
              {q.latestAnswer?.feedback ? <ScoreBadge score={q.latestAnswer.feedback.overallScore} size="sm" /> : <span className="shrink-0 text-muted">Skipped</span>}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={`/interviews/${id}/feedback`} className={btn}>Review every answer</Link>
        <Link to="/new" className={btnGhost}>Practice again</Link>
        <Link to="/history" className={btnGhost}>See progress</Link>
      </div>
    </>
  );
}
