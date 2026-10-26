import { Link } from 'react-router-dom';
import { useInterviews, useOverview } from '../api/hooks';
import ScoreBadge from '../components/ScoreBadge';
import { btn, PageTitle, sheet, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { fmtDate, TYPE_LABELS } from '../lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const overview = useOverview();
  const recent = useInterviews({ page: 1, limit: 5 });
  const o = overview.data;

  const stats = [
    ['Completed', o ? String(o.completedInterviews) : '—'],
    ['Average score', o?.averageScore != null ? o.averageScore.toFixed(1) : '—'],
    ['Best score', o?.bestScore != null ? o.bestScore.toFixed(1) : '—'],
    ['Day streak', o ? String(o.streakDays) : '—'],
  ];

  return (
    <>
      <PageTitle sub="Answer realistic questions, get scored feedback, and watch the numbers climb.">
        Welcome back, {user?.fullName.split(' ')[0]}
      </PageTitle>

      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([k, v]) => (
            <div key={k} className={`${sheet} px-4 py-3`}>
              <dt className="text-sm text-muted">{k}</dt>
              <dd className="font-serif text-3xl font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <Link to="/new" className={`${btn} sm:self-stretch sm:px-6`}>Start an interview</Link>
      </div>

      <section className={`${sheet} p-5`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent interviews</h2>
          <Link to="/history" className="text-sm font-medium text-pine underline">View all</Link>
        </div>
        {recent.isLoading && <Spinner />}
        {recent.data && recent.data.data.length === 0 && (
          <p className="py-6 text-sm text-muted">No interviews yet. Add a resume and a job description, and your first set of questions will be ready in about 15 seconds.</p>
        )}
        <ul className="divide-y divide-line">
          {recent.data?.data.map((i) => (
            <li key={i.id}>
              <Link
                to={i.status === 'in_progress' ? `/interviews/${i.id}/practice` : `/interviews/${i.id}/summary`}
                className="flex items-center justify-between gap-4 py-3 hover:bg-desk/50"
              >
                <div>
                  <div className="font-medium">{i.jobRole}{i.companyName ? ` at ${i.companyName}` : ''}</div>
                  <div className="text-sm text-muted">
                    {TYPE_LABELS[i.interviewType]} interview, {i.questionCount} questions, {fmtDate(i.startedAt)}
                  </div>
                </div>
                {i.status === 'completed' ? <ScoreBadge score={i.overallScore} size="sm" /> : (
                  <span className="text-sm font-medium text-warn">{i.status === 'in_progress' ? 'Resume' : 'Abandoned'}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
