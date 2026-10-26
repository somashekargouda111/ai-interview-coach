import { describe, expect, it } from 'vitest';
import { buildQuestionPlan, categoryScores, overallScore, WEIGHTS } from './scoring';

describe('scoring', () => {
  it('weights sum to 1', () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });

  it('overall of all-10 scores is 10 and of all-0 is 0', () => {
    const mk = (n: number) => ({ relevance: n, clarity: n, structure: n, specificity: n, confidence: n });
    expect(overallScore(mk(10))).toBe(10);
    expect(overallScore(mk(0))).toBe(0);
  });

  it('builds a plan of the requested length', () => {
    expect(buildQuestionPlan('mixed', 11)).toHaveLength(11);
    expect(new Set(buildQuestionPlan('technical', 5))).toEqual(new Set(['technical']));
  });

  it('technical score is null when no technical questions were answered', () => {
    const item = { type: 'hr', overall: 7, relevance: 7, clarity: 7, structure: 7, specificity: 7, confidence: 7 };
    expect(categoryScores([item]).technical).toBeNull();
    expect(categoryScores([item]).overall).toBe(7);
  });
});
