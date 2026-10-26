import { STAR_INSTRUCTIONS, STAR_JSON_SHAPE } from './star';
import { truncate, wrap, UNTRUSTED_NOTE } from './util';

export const EVALUATION_SYSTEM = `You are a fair but demanding interview coach who scores answers against a clear rubric and gives actionable feedback. ${UNTRUSTED_NOTE}
Respond with JSON only.`;

export interface EvaluationPromptInput {
  role: string;
  difficulty: string;
  questionType: string;
  questionText: string;
  expectedKeywords: string[];
  answerText: string;
  inputMode: 'text' | 'voice';
  resumeText?: string | null;
  jobDescription?: string | null;
}

export function evaluationPrompt(i: EvaluationPromptInput) {
  const behavioral = i.questionType === 'behavioral';
  return `Evaluate the candidate's answer to this interview question.

Role: ${i.role}
Difficulty: ${i.difficulty}
Question type: ${i.questionType}
Expected concepts (guidance only, not a checklist): ${i.expectedKeywords.join(', ') || 'none'}
${i.inputMode === 'voice' ? 'The answer was spoken and auto-transcribed: ignore punctuation, capitalization and minor transcription errors.\n' : ''}
Scoring rubric (0-10, one decimal allowed). Be calibrated: 5 = acceptable but unremarkable, 7 = solid, 9-10 = exceptional and rare. Short, vague, or off-topic answers must score low (0-3).
- relevance: does it directly answer the question asked?
- clarity: is it easy to follow, concise, free of rambling?
- structure: logical flow (clear opening, organized points, closing)?
- specificity: concrete examples, numbers, tools, decisions (vs generic claims)?
- confidence: professional tone, ownership, no excessive hedging or filler.

${behavioral ? STAR_INSTRUCTIONS : 'This is not a behavioral question: set "starAnalysis" to null.'}

Feedback rules:
- strengths: 0-4 items, each specific to this answer.
- weaknesses: 0-4 items, each specific and honest.
- improvementSuggestions: 2-4 concrete actions the candidate can take next attempt.
- improvedAnswer: rewrite the answer so it would score 9+, roughly 120-220 words, first person, spoken style. Reuse only facts present in the answer or the resume. Never invent employers, projects, or metrics; where a number is missing use a placeholder such as [X%].

Context (for relevance only):
${wrap('resume', truncate(i.resumeText?.trim() || '(not provided)', 6000))}
${wrap('job_description', truncate(i.jobDescription?.trim() || '(not provided)', 3000))}

${wrap('question', i.questionText)}
${wrap('answer', truncate(i.answerText, 5000))}

Return exactly this JSON shape:
{
  "scores": { "relevance": 0, "clarity": 0, "structure": 0, "specificity": 0, "confidence": 0 },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvementSuggestions": ["string"],
  "improvedAnswer": "string",
  ${behavioral ? STAR_JSON_SHAPE : '"starAnalysis": null'}
}`;
}
