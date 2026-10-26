import type { Answer, AnswerFeedback, Prisma } from '@prisma/client';

export type AnswerWithFeedback = Answer & { feedback: AnswerFeedback | null };

export const num = (d: Prisma.Decimal | number | null | undefined) => (d == null ? null : Number(d));

export function toFeedbackDto(f: AnswerFeedback) {
  return {
    overallScore: Number(f.overallScore),
    scores: {
      relevance: Number(f.relevanceScore),
      clarity: Number(f.clarityScore),
      structure: Number(f.structureScore),
      specificity: Number(f.specificityScore),
      confidence: Number(f.confidenceScore),
    },
    strengths: f.strengths as string[],
    weaknesses: f.weaknesses as string[],
    improvementSuggestions: f.improvementSuggestions as string[],
    improvedAnswer: f.improvedAnswer,
    starAnalysis: f.starAnalysis ?? null,
  };
}

export const toAnswerDto = (a: AnswerWithFeedback) => ({
  id: a.id,
  attemptNumber: a.attemptNumber,
  answerText: a.answerText,
  wordCount: a.wordCount,
  durationSeconds: a.durationSeconds,
  submittedAt: a.submittedAt,
  feedback: a.feedback ? toFeedbackDto(a.feedback) : null,
});
