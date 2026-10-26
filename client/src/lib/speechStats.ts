// Speech-to-text engines often drop "um"/"uh" from transcripts, so filler counts from the
// Web Speech API are a lower bound. Whisper-style transcription keeps them (see README).
const FILLERS = ['um', 'uh', 'erm', 'you know', 'i mean', 'basically', 'actually', 'literally', 'sort of', 'kind of'];

export function fillerCounts(text: string): Record<string, number> {
  const t = ` ${text.toLowerCase().replace(/[^a-z' ]/g, ' ')} `;
  const out: Record<string, number> = {};
  for (const f of FILLERS) {
    const n = t.split(` ${f} `).length - 1;
    if (n > 0) out[f] = n;
  }
  return out;
}

export const wordsPerMinute = (words: number, seconds: number) =>
  seconds >= 5 ? Math.round((words / seconds) * 60) : null;
