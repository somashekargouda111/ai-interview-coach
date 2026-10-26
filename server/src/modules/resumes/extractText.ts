import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { AppError } from '../../utils/AppError';

const MAX_CHARS = 20000;
export const MIN_CHARS = 50;

export const normalizeText = (s: string) =>
  s.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_CHARS);

export async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  let raw = '';
  try {
    if (mimetype === 'application/pdf') raw = (await pdfParse(buffer)).text;
    else if (mimetype.includes('wordprocessingml')) raw = (await mammoth.extractRawText({ buffer })).value;
    else raw = buffer.toString('utf8');
  } catch {
    throw new AppError(400, 'VALIDATION_ERROR', 'Could not read this file. Try another file or paste the text instead.');
  }
  const text = normalizeText(raw);
  if (text.length < MIN_CHARS) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Not enough text found in the file (scanned PDFs are not supported). Paste your resume text instead.',
    );
  }
  return text;
}
