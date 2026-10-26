import { prisma } from '../../db/prisma';
import { num } from '../answers/dto';
import { round1 } from '../interviews/scoring';

const iso = (d: Date) => d.toISOString().slice(0, 10);

export async function overview(userId: string) {
  const [totalInterviews, completed, agg, totalAnswers] = await Promise.all([
    prisma.interview.count({ where: { userId } }),
    prisma.interview.findMany({ where: { userId, status: 'completed' }, select: { completedAt: true } }),
    prisma.interviewSummary.aggregate({
      where: { interview: { userId } },
      _avg: { overallScore: true },
      _max: { overallScore: true },
    }),
    prisma.answer.count({ where: { question: { interview: { userId } } } }),
  ]);

  // Streak = consecutive UTC days with a completed interview, ending today or yesterday.
  const days = new Set(completed.flatMap((c) => (c.completedAt ? [iso(c.completedAt)] : [])));
  const cursor = new Date();
  if (!days.has(iso(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (days.has(iso(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const avgScore = num(agg._avg.overallScore);
  return {
    totalInterviews,
    completedInterviews: completed.length,
    totalAnswers,
    averageScore: avgScore == null ? null : round1(avgScore),
    bestScore: num(agg._max.overallScore),
    streakDays: streak,
  };
}

export async function trend(userId: string, days: number) {
  const since = new Date(Date.now() - days * 86_400_000);
  const rows = await prisma.interviewSummary.findMany({
    where: { interview: { userId, completedAt: { gte: since } } },
    include: { interview: { select: { id: true, completedAt: true, jobRole: true, interviewType: true } } },
    orderBy: { interview: { completedAt: 'asc' } },
  });
  return {
    points: rows.map((r) => ({
      date: iso(r.interview.completedAt as Date),
      overallScore: Number(r.overallScore),
      interviewId: r.interview.id,
      jobRole: r.interview.jobRole,
      interviewType: r.interview.interviewType,
    })),
  };
}

export async function categories(userId: string) {
  const a = await prisma.answerFeedback.aggregate({
    where: { answer: { question: { interview: { userId } } } },
    _avg: { relevanceScore: true, clarityScore: true, structureScore: true, specificityScore: true, confidenceScore: true },
  });
  const raw = {
    relevance: num(a._avg.relevanceScore),
    clarity: num(a._avg.clarityScore),
    structure: num(a._avg.structureScore),
    specificity: num(a._avg.specificityScore),
    confidence: num(a._avg.confidenceScore),
  };
  const entries = Object.entries(raw).filter((e): e is [string, number] => e[1] != null);
  const averages = Object.fromEntries(entries.map(([k, v]) => [k, round1(v)]));
  const weakest = entries.length ? entries.reduce((m, e) => (e[1] < m[1] ? e : m))[0] : null;
  return { averages, weakestCategory: weakest };
}
