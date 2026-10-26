import { truncate, wrap, UNTRUSTED_NOTE } from './util';

export const SKILLS_SYSTEM = `You extract structured data from resumes. ${UNTRUSTED_NOTE}
Respond with JSON only.`;

export const skillsPrompt = (resumeText: string) => `Extract the candidate's skills from the resume.

Rules:
- Include only skills explicitly present in the resume: technologies, programming languages, tools, frameworks, methodologies, and notable soft skills.
- Max 30 items, no duplicates, short canonical names (e.g. "PostgreSQL", not "worked with PostgreSQL databases").

${wrap('resume', truncate(resumeText, 12000))}

Return exactly this JSON shape:
{ "skills": ["string"] }`;
