export type QuestionType = 'hr' | 'behavioral' | 'technical' | 'system_design';
export type InterviewType = QuestionType | 'mixed';

export const WEIGHTS = { relevance: 0.25, specificity: 0.25, structure: 0.2, clarity: 0.15, confidence: 0.15 } as const;
export type Scores = Record<keyof typeof WEIGHTS, number>;

export const round1 = (n: number) => Math.round(n * 10) / 10;

/** Overall answer score is computed here, not trusted from the model. */
export const overallScore = (s: Scores) =>
  round1((Object.keys(WEIGHTS) as (keyof Scores)[]).reduce((sum, k) => sum + s[k] * WEIGHTS[k], 0));

export const avg = (xs: number[]) => (xs.length ? round1(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

const MIXED_CYCLE: QuestionType[] = ['behavioral', 'technical', 'hr', 'technical', 'system_design', 'behavioral', 'technical', 'hr'];

export function buildQuestionPlan(type: InterviewType, n: number): QuestionType[] {
  if (type !== 'mixed') return Array(n).fill(type);
  return Array.from({ length: n }, (_, i) => MIXED_CYCLE[i % MIXED_CYCLE.length]);
}

export interface ScoredAnswer extends Scores {
  type: string;
  overall: number;
}

export function categoryScores(items: ScoredAnswer[]) {
  const technical = items.filter((i) => i.type === 'technical' || i.type === 'system_design');
  return {
    overall: avg(items.map((i) => i.overall)),
    content: avg(items.flatMap((i) => [i.relevance, i.specificity])),
    structure: avg(items.map((i) => i.structure)),
    communication: avg(items.flatMap((i) => [i.clarity, i.confidence])),
    technical: avg(technical.map((i) => i.overall)),
  };
}

export const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
