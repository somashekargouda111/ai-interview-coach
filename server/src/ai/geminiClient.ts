import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const genai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

interface JsonRequest<T> {
  system: string;
  prompt: string;
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  temperature?: number;
}

const stripFences = (s: string) =>
  s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Gemini request timed out')), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

function toAppError(err: any): AppError {
  const status = err?.status ?? err?.code;
  const msg =
    status === 429
      ? 'The AI service is rate limited right now. Please retry in a minute.'
      : 'The AI service is temporarily unavailable. Please try again.';
  console.error('Gemini API error details:', {
  status,
  message: err?.message,
  name: err?.name,
});
  return new AppError(503, 'AI_UNAVAILABLE', msg);
}

/**
 * Calls Gemini in JSON mode and validates the result with Zod.
 * One corrective retry on malformed/invalid JSON; API/network errors are surfaced as 503.
 */
export async function generateJson<T>({ system, prompt, schema, temperature = 0.4 }: JsonRequest<T>): Promise<T> {
  let lastIssue = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const contents = attempt === 0
      ? prompt
      : `${prompt}\n\nYour previous reply was rejected: ${lastIssue}\nReply again with ONLY valid JSON that matches the required shape.`;

    let text: string;
    try {
      const res = await withTimeout(
        genai.models.generateContent({
          model: env.GEMINI_MODEL,
          contents,
          config: { systemInstruction: system, responseMimeType: 'application/json', temperature },
        }),
        env.GEMINI_TIMEOUT_MS,
      );
      text = res.text ?? '';
    } catch (err) {
      throw toAppError(err);
    }

    try {
      return schema.parse(JSON.parse(stripFences(text)));
    } catch (err) {
      lastIssue =
        err instanceof z.ZodError
          ? err.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
          : 'not parseable as JSON';
      console.warn(`Gemini output rejected (attempt ${attempt + 1}): ${lastIssue}`);
    }
  }
  throw new AppError(502, 'AI_RESPONSE_INVALID', 'The AI returned an unexpected response. Please try again.');
}
