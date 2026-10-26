import { z } from 'zod';

/** Accepts 7, 7.5 or "7.5"; clamps to 0-10 and rounds to one decimal. Rejects null/NaN/text. */
const score = z
  .union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)])
  .pipe(z.number().finite())
  .transform((n) => Math.min(10, Math.max(0, Math.round(n * 10) / 10)));

const line = z.string().trim().min(1).max(1500);
const lines = (min: number, max: number) => z.array(line).min(min).transform((a) => a.slice(0, max));

export const skillsSchema = z.object({
  skills: z.array(z.string().trim().min(1).max(60)).max(60),
});

export const questionsSchema = (n: number) =>
  z.object({
    questions: z
      .array(
        z.object({
          text: z.string().trim().min(10).max(700),
          expectedKeywords: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
        }),
      )
      .min(n),
  });

const starPart = z.object({ present: z.boolean(), feedback: z.string().trim().max(1000) });
export const starSchema = z.object({
  situation: starPart,
  task: starPart,
  action: starPart,
  result: starPart,
  starScore: score,
});

export const evaluationSchema = z.object({
  scores: z.object({
    relevance: score,
    clarity: score,
    structure: score,
    specificity: score,
    confidence: score,
  }),
  strengths: lines(0, 5),
  weaknesses: lines(0, 5),
  improvementSuggestions: lines(1, 5),
  improvedAnswer: z.string().trim().min(20).max(4000),
  starAnalysis: starSchema.nullish(),
});

export const summaryNarrativeSchema = z.object({
  strengths: lines(0, 5),
  weaknesses: lines(0, 5),
  recommendedActions: lines(1, 6),
});

export type Evaluation = z.infer<typeof evaluationSchema>;
export type StarAnalysis = z.infer<typeof starSchema>;
