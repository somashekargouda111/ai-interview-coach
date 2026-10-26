import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError, notFound } from '../../utils/AppError';
import { evaluateAnswer, MODEL_NAME } from '../../ai';
import { countWords, overallScore } from '../interviews/scoring';
import { toAnswerDto, toFeedbackDto, type AnswerWithFeedback } from './dto';

const MAX_ATTEMPTS = 5;

export async function submitAnswer(
  userId: string,
  questionId: string,
  input: { answerText: string; durationSeconds?: number; inputMode: 'text' | 'voice' },
) {
  // Ownership is enforced through the parent interview.
  const question = await prisma.question.findFirst({
    where: { id: questionId, interview: { userId } },
    include: { interview: { include: { resume: true } } },
  });
  if (!question) throw notFound('Question');
  const { interview } = question;
  if (interview.status !== 'in_progress') throw new AppError(409, 'CONFLICT', 'This interview is no longer in progress');

  const last = await prisma.answer.aggregate({ where: { questionId }, _max: { attemptNumber: true } });
  const attemptNumber = (last._max.attemptNumber ?? 0) + 1;
  if (attemptNumber > MAX_ATTEMPTS) {
    throw new AppError(409, 'CONFLICT', `You can attempt each question up to ${MAX_ATTEMPTS} times`);
  }

  // Evaluate before saving: an AI failure leaves no half-saved answer.
  const ev = await evaluateAnswer({
    role: interview.jobRole,
    difficulty: interview.difficultyLevel,
    questionType: question.questionType,
    questionText: question.questionText,
    expectedKeywords: question.expectedKeywords,
    answerText: input.answerText,
    inputMode: input.inputMode,
    resumeText: interview.resume?.extractedText,
    jobDescription: interview.jobDescription,
  });

  const star = question.questionType === 'behavioral' ? ev.starAnalysis ?? null : null;

  const saved = await prisma.answer.create({
    data: {
      questionId,
      attemptNumber,
      answerText: input.answerText,
      transcriptText: input.inputMode === 'voice' ? input.answerText : null,
      durationSeconds: input.durationSeconds,
      wordCount: countWords(input.answerText),
      feedback: {
        create: {
          overallScore: overallScore(ev.scores),
          relevanceScore: ev.scores.relevance,
          clarityScore: ev.scores.clarity,
          structureScore: ev.scores.structure,
          specificityScore: ev.scores.specificity,
          confidenceScore: ev.scores.confidence,
          strengths: ev.strengths,
          weaknesses: ev.weaknesses,
          improvementSuggestions: ev.improvementSuggestions,
          improvedAnswer: ev.improvedAnswer,
          starAnalysis: star ?? Prisma.DbNull,
          modelName: MODEL_NAME,
        },
      },
    },
    include: { feedback: true },
  });

  return {
    answer: { id: saved.id, attemptNumber, wordCount: saved.wordCount, submittedAt: saved.submittedAt },
    feedback: toFeedbackDto(saved.feedback!),
  };
}

export async function listAnswers(userId: string, questionId: string) {
  const question = await prisma.question.findFirst({
    where: { id: questionId, interview: { userId } },
    include: { answers: { orderBy: { attemptNumber: 'asc' }, include: { feedback: true } } },
  });
  if (!question) throw notFound('Question');
  return { data: question.answers.map((a) => toAnswerDto(a as AnswerWithFeedback)) };
}
