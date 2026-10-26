import { truncate, wrap, UNTRUSTED_NOTE } from './util';

export const QUESTIONS_SYSTEM = `You are a senior interviewer who writes realistic, specific interview questions. ${UNTRUSTED_NOTE}
Respond with JSON only.`;

const DIFFICULTY: Record<string, string> = {
  easy: 'Entry-level depth. Fundamentals and straightforward situations.',
  medium: 'Working-professional depth. Requires concrete experience and trade-off thinking.',
  hard: 'Senior depth. Ambiguity, scale, trade-offs, and probing follow-through.',
};

const TYPE_GUIDE: Record<string, string> = {
  hr: 'motivation, culture fit, career goals, strengths/weaknesses, salary/availability style questions',
  behavioral: 'past-experience questions that invite a STAR answer ("Tell me about a time...")',
  technical: 'role-specific technical knowledge, debugging, coding concepts or tools named in the resume/JD',
  system_design: 'a scoped design problem (components, data flow, scaling, trade-offs) suited to the role',
};

export interface QuestionsPromptInput {
  role: string;
  company?: string | null;
  experienceLevel?: string | null;
  difficulty: string;
  plan: string[]; // question type per position, built in code
  resumeText?: string | null;
  jobDescription?: string | null;
}

export function questionsPrompt(i: QuestionsPromptInput) {
  const planLines = i.plan.map((t, idx) => `${idx + 1}. ${t}`).join('\n');
  const typeGuide = [...new Set(i.plan)].map((t) => `- ${t}: ${TYPE_GUIDE[t]}`).join('\n');

  return `Write ${i.plan.length} mock interview questions for this candidate.

Target role: ${i.role}${i.company ? `\nCompany: ${i.company}` : ''}${i.experienceLevel ? `\nCandidate experience level: ${i.experienceLevel}` : ''}
Difficulty: ${i.difficulty} - ${DIFFICULTY[i.difficulty] ?? DIFFICULTY.medium}

Question plan (one question per line, in this exact order and type):
${planLines}

Type guide:
${typeGuide}

Requirements:
- Personalize: reference real projects, tools, or experience from the resume and requirements from the job description wherever possible. If neither is provided, write strong generic questions for the role.
- Every question is a single question, answerable aloud in 1-3 minutes. No multi-part lists.
- No duplicates or near-duplicates; vary topics.
- Do not include answers or hints in the question text.
- expectedKeywords: 3-6 concepts, terms, or behaviors a strong answer would likely touch.

${wrap('resume', truncate(i.resumeText?.trim() || '(not provided)', 8000))}

${wrap('job_description', truncate(i.jobDescription?.trim() || '(not provided)', 5000))}

Return exactly this JSON shape, with ${i.plan.length} items in plan order:
{ "questions": [ { "text": "string", "expectedKeywords": ["string"] } ] }`;
}
