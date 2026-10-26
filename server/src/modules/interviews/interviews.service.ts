import { Prisma, type InterviewSummary } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError, notFound } from '../../utils/AppError';
import { generateQuestions, generateSummaryNarrative, MODEL_NAME } from '../../ai';
import { toAnswerDto, num, type AnswerWithFeedback } from '../answers/dto';
import { buildQuestionPlan, categoryScores, type InterviewType, type ScoredAnswer } from './scoring';

export interface CreateInterviewInput {
  resumeId?: string | null; // undefined = use active resume, null = no resume
  jobRole?: string;
  companyName?: string;
  jobDescription?: string;
  interviewType: InterviewType;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  numQuestions: number;
}

const questionDto = (q: { id: string; questionOrder: number; questionType: string; questionText: string }) => ({
  id: q.id,
  order: q.questionOrder,
  type: q.questionType,
  text: q.questionText,
});

export async function createInterview(userId: string, input: CreateInterviewInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Account no longer exists');

  let resume = null;
  if (input.resumeId) {
    resume = await prisma.resume.findFirst({ where: { id: input.resumeId, userId } });
    if (!resume) throw notFound('Resume');
  } else if (input.resumeId === undefined) {
    resume = await prisma.resume.findFirst({ where: { userId, isActive: true } });
  }

  const jobRole = input.jobRole || user.targetRole || 'Role described in the job description';
  const plan = buildQuestionPlan(input.interviewType, input.numQuestions);

  // Generate first: if the AI fails, nothing is written.
  const generated = await generateQuestions({
    role: jobRole,
    company: input.companyName,
    experienceLevel: user.experienceLevel,
    difficulty: input.difficultyLevel,
    plan,
    resumeText: resume?.extractedText,
    jobDescription: input.jobDescription,
  });

  const created = await prisma.interview.create({
    data: {
      userId,
      resumeId: resume?.id ?? null,
      jobRole,
      companyName: input.companyName,
      jobDescription: input.jobDescription,
      interviewType: input.interviewType,
      difficultyLevel: input.difficultyLevel,
      questions: {
        create: generated.map((q, i) => ({
          questionOrder: i + 1,
          questionText: q.text,
          questionType: q.type,
          expectedKeywords: q.expectedKeywords,
          modelName: MODEL_NAME,
        })),
      },
    },
    include: { questions: { orderBy: { questionOrder: 'asc' } } },
  });

  return {
    id: created.id,
    status: created.status,
    interviewType: created.interviewType,
    questions: created.questions.map(questionDto),
  };
}

export async function getInterview(userId: string, id: string) {
  const iv = await prisma.interview.findFirst({
    where: { id, userId },
    include: {
      questions: {
        orderBy: { questionOrder: 'asc' },
        include: { answers: { orderBy: { attemptNumber: 'desc' }, include: { feedback: true } } },
      },
    },
  });
  if (!iv) throw notFound('Interview');
  return {
    id: iv.id,
    jobRole: iv.jobRole,
    companyName: iv.companyName,
    interviewType: iv.interviewType,
    difficultyLevel: iv.difficultyLevel,
    status: iv.status,
    startedAt: iv.startedAt,
    completedAt: iv.completedAt,
    questions: iv.questions.map((q) => ({
      ...questionDto(q),
      attemptCount: q.answers.length,
      latestAnswer: q.answers[0] ? toAnswerDto(q.answers[0] as AnswerWithFeedback) : null,
    })),
  };
}

export async function listInterviews(
  userId: string,
  q: { page: number; limit: number; type?: string; status?: string },
) {
  const where: Prisma.InterviewWhereInput = {
    userId,
    ...(q.type ? { interviewType: q.type } : {}),
    ...(q.status ? { status: q.status } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.interview.count({ where }),
    prisma.interview.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: { summary: { select: { overallScore: true } }, _count: { select: { questions: true } } },
    }),
  ]);
  return {
    data: rows.map((r) => ({
      id: r.id,
      jobRole: r.jobRole,
      companyName: r.companyName,
      interviewType: r.interviewType,
      difficultyLevel: r.difficultyLevel,
      status: r.status,
      questionCount: r._count.questions,
      overallScore: num(r.summary?.overallScore),
      startedAt: r.startedAt,
      completedAt: r.completedAt,
    })),
    pagination: { page: q.page, limit: q.limit, total },
  };
}

type SummaryRow = InterviewSummary;

const summaryDto = (interviewId: string, status: string, s: SummaryRow) => ({
  interviewId,
  status,
  summary: {
    overallScore: Number(s.overallScore),
    categoryScores: {
      content: num(s.contentScore),
      structure: num(s.structureScore),
      communication: num(s.communicationScore),
      technical: num(s.technicalScore),
    },
    totalQuestions: s.totalQuestions,
    answeredQuestions: s.answeredQuestions,
    strengths: s.strengths as string[],
    weaknesses: s.weaknesses as string[],
    recommendedActions: s.recommendedActions as string[],
  },
});

export async function completeInterview(userId: string, id: string) {
  const iv = await prisma.interview.findFirst({
    where: { id, userId },
    include: {
      summary: true,
      questions: {
        orderBy: { questionOrder: 'asc' },
        include: { answers: { orderBy: { attemptNumber: 'desc' }, take: 1, include: { feedback: true } } },
      },
    },
  });
  if (!iv) throw notFound('Interview');
  if (iv.summary) return summaryDto(iv.id, iv.status, iv.summary); // idempotent
  if (iv.status === 'abandoned') throw new AppError(409, 'CONFLICT', 'This interview was abandoned');

  // Score from the latest attempt of each answered question; unanswered ones are excluded.
  const scored = iv.questions.flatMap((q) => {
    const f = q.answers[0]?.feedback;
    if (!f) return [];
    return [{
      order: q.questionOrder,
      question: q.questionText,
      type: q.questionType,
      overall: Number(f.overallScore),
      relevance: Number(f.relevanceScore),
      clarity: Number(f.clarityScore),
      structure: Number(f.structureScore),
      specificity: Number(f.specificityScore),
      confidence: Number(f.confidenceScore),
      strengths: f.strengths as string[],
      weaknesses: f.weaknesses as string[],
    }];
  });
  if (!scored.length) throw new AppError(400, 'VALIDATION_ERROR', 'Answer at least one question before finishing.');

  const cats = categoryScores(scored as ScoredAnswer[]);
  const overall = cats.overall as number;

  const narrative = await generateSummaryNarrative({
    role: iv.jobRole,
    interviewType: iv.interviewType,
    overall,
    categories: cats,
    unanswered: iv.questions.length - scored.length,
    items: scored.map((s) => ({
      order: s.order, type: s.type, question: s.question, score: s.overall, strengths: s.strengths, weaknesses: s.weaknesses,
    })),
  });

  const [summary] = await prisma.$transaction([
    prisma.interviewSummary.create({
      data: {
        interviewId: iv.id,
        overallScore: overall,
        contentScore: cats.content,
        structureScore: cats.structure,
        communicationScore: cats.communication,
        technicalScore: cats.technical,
        totalQuestions: iv.questions.length,
        answeredQuestions: scored.length,
        strengths: narrative.strengths,
        weaknesses: narrative.weaknesses,
        recommendedActions: narrative.recommendedActions,
      },
    }),
    prisma.interview.update({ where: { id: iv.id }, data: { status: 'completed', completedAt: new Date() } }),
  ]);
  return summaryDto(iv.id, 'completed', summary);
}

export async function getSummary(userId: string, id: string) {
  const iv = await prisma.interview.findFirst({ where: { id, userId }, include: { summary: true } });
  if (!iv) throw notFound('Interview');
  if (!iv.summary) throw notFound('Summary');
  return summaryDto(iv.id, iv.status, iv.summary);
}

export async function abandonInterview(userId: string, id: string) {
  const r = await prisma.interview.updateMany({ where: { id, userId, status: 'in_progress' }, data: { status: 'abandoned' } });
  if (!r.count) throw new AppError(409, 'CONFLICT', 'Only an in-progress interview can be abandoned');
}

export async function deleteInterview(userId: string, id: string) {
  const r = await prisma.interview.deleteMany({ where: { id, userId } });
  if (!r.count) throw notFound('Interview');
}
