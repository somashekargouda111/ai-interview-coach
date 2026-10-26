import { env } from '../config/env';
import { generateJson } from './geminiClient';
import { evaluationSchema, questionsSchema, skillsSchema, summaryNarrativeSchema } from './schemas';
import { QUESTIONS_SYSTEM, questionsPrompt, QuestionsPromptInput } from './prompts/questions';
import { EVALUATION_SYSTEM, evaluationPrompt, EvaluationPromptInput } from './prompts/evaluation';
import { SKILLS_SYSTEM, skillsPrompt } from './prompts/resume';
import { SUMMARY_SYSTEM, summaryPrompt, SummaryPromptInput } from './prompts/summary';

export const MODEL_NAME = env.GEMINI_MODEL;

export async function extractResumeSkills(resumeText: string): Promise<string[]> {
  const out = await generateJson({
    system: SKILLS_SYSTEM,
    prompt: skillsPrompt(resumeText),
    schema: skillsSchema,
    temperature: 0.1,
  });
  return [...new Set(out.skills)].slice(0, 30);
}

export async function generateQuestions(input: QuestionsPromptInput) {
  const out = await generateJson({
    system: QUESTIONS_SYSTEM,
    prompt: questionsPrompt(input),
    schema: questionsSchema(input.plan.length),
    temperature: 0.8,
  });
  // The type of each question comes from the plan built in code, not from the model.
  return out.questions.slice(0, input.plan.length).map((q, idx) => ({
    text: q.text,
    type: input.plan[idx],
    expectedKeywords: q.expectedKeywords,
  }));
}

export function evaluateAnswer(input: EvaluationPromptInput) {
  return generateJson({
    system: EVALUATION_SYSTEM,
    prompt: evaluationPrompt(input),
    schema: evaluationSchema,
    temperature: 0.3,
  });
}

export function generateSummaryNarrative(input: SummaryPromptInput) {
  return generateJson({
    system: SUMMARY_SYSTEM,
    prompt: summaryPrompt(input),
    schema: summaryNarrativeSchema,
    temperature: 0.4,
  });
}
