import { UNTRUSTED_NOTE } from './util';

export const SUMMARY_SYSTEM = `You are an interview coach writing a final debrief from per-question results. ${UNTRUSTED_NOTE}
Respond with JSON only.`;

export interface SummaryPromptInput {
  role: string;
  interviewType: string;
  overall: number;
  categories: { content: number | null; structure: number | null; communication: number | null; technical: number | null };
  unanswered: number;
  items: { order: number; type: string; question: string; score: number; strengths: string[]; weaknesses: string[] }[];
}

export function summaryPrompt(i: SummaryPromptInput) {
  const rows = i.items
    .map(
      (q) =>
        `Q${q.order} [${q.type}] score ${q.score}/10\n  question: ${q.question}\n  strengths: ${q.strengths.slice(0, 2).join(' | ') || '-'}\n  weaknesses: ${q.weaknesses.slice(0, 2).join(' | ') || '-'}`,
    )
    .join('\n');

  return `Write the final debrief for a mock interview.

Role: ${i.role}
Interview type: ${i.interviewType}
Computed scores (already final, do not recompute): overall ${i.overall}, content ${i.categories.content}, structure ${i.categories.structure}, communication ${i.categories.communication}, technical ${i.categories.technical ?? 'n/a'}
Unanswered questions: ${i.unanswered}

Per-question results:
${rows}

Rules:
- Base every point on the results above; look for patterns across questions, not single answers.
- strengths: 0-4 items. weaknesses: 0-4 items.
- recommendedActions: 3-5 concrete practice steps, ordered by impact (e.g. "Prepare three STAR stories that end with a measurable result").
- Plain, encouraging but honest tone. Do not mention the scores' computation.

Return exactly this JSON shape:
{ "strengths": ["string"], "weaknesses": ["string"], "recommendedActions": ["string"] }`;
}
