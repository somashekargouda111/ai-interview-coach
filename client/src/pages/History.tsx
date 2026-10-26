import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories, useDeleteInterview, useInterviews, useTrend } from '../api/hooks';
import ProgressChart from '../components/ProgressChart';
import ScoreBadge from '../components/ScoreBadge';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { btnGhost, ErrorBox, input, PageTitle, sheet, Spinner } from '../components/ui';
import { errMsg, fmtDate, TYPE_LABELS } from '../lib/utils';

export default function History() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const list = useInterviews({ page, limit: 10, type: type || undefined, status: status || undefined });
  const trend = useTrend(90);
  const cats = useCategories();
  const del = useDeleteInterview();

  const total = list.data?.pagination.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / 10));
  const a = cats.data?.averages ?? {};

  return (
    <>
      <PageTitle sub="Your scores over the last 90 days and across every answer you have given.">History and progress</PageTitle>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className={`${sheet} p-5`}>
          <h2 className="mb-2 font-semibold">Overall score over time</h2>
          {trend.isLoading ? <Spinner /> : <ProgressChart points={trend.data ?? []} />}
        </section>
        <section className={`${sheet} p-5`}>
          <h2 className="mb-3 font-semibold">Average by skill</h2>
          {cats.isLoading && <Spinner />}
          {cats.data && Object.keys(a).length === 0 && <p className="text-sm text-muted">Answer a few questions to see your averages.</p>}
          {Object.keys(a).length > 0 && (
            <>
              <ScoreBreakdown items={Object.entries(a).map(([label, value]) => ({ label, value }))} />
              {cats.data?.weakestCategory && (
                <p className="mt-4 rounded-md bg-marker/50 px-3 py-2 text-sm">
                  Weakest area: <strong className="capitalize">{cats.data.weakestCategory}</strong>. Focus your next session there.
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <section className={`${sheet} p-5`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">All interviews</h2>
          <div className="flex gap-2">
            <select aria-label="Filter by type" className={`${input} !w-auto`} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              <option value="">All types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select aria-label="Filter by status" className={`${input} !w-auto`} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">Any status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In progress</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>
        </div>

        {del.error && <div className="mb-3"><ErrorBox>{errMsg(del.error)}</ErrorBox></div>}
        {list.isLoading && <Spinner />}
        {list.data && list.data.data.length === 0 && <p className="py-6 text-sm text-muted">No interviews match these filters.</p>}

        <ul className="divide-y divide-line">
          {list.data?.data.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-4 py-3">
              <Link to={i.status === 'in_progress' ? `/interviews/${i.id}/practice` : `/interviews/${i.id}/summary`} className="min-w-0 flex-1">
                <div className="truncate font-medium">{i.jobRole}{i.companyName ? ` at ${i.companyName}` : ''}</div>
                <div className="text-sm text-muted">{TYPE_LABELS[i.interviewType]}, {i.difficultyLevel}, {i.questionCount} questions, {fmtDate(i.startedAt)}</div>
              </Link>
              {i.status === 'completed'
                ? <ScoreBadge score={i.overallScore} size="sm" />
                : <span className="text-sm text-warn">{i.status === 'in_progress' ? 'In progress' : 'Abandoned'}</span>}
              <button
                className="text-sm text-muted underline hover:text-flag"
                onClick={() => window.confirm('Delete this interview and all its answers? This cannot be undone.') && del.mutate(i.id)}
                disabled={del.isPending}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <button className={btnGhost} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="text-muted">Page {page} of {pages}</span>
            <button className={btnGhost} disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </section>
    </>
  );
}
