import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCompleteInterview, useInterview, useSubmitAnswer } from '../api/hooks';
import type { SubmitResult } from '../api/types';
import FeedbackCard from '../components/FeedbackCard';
import VoiceRecorder from '../components/VoiceRecorder';
import { btn, btnGhost, ErrorBox, input, sheet, Spinner } from '../components/ui';
import { errMsg, TYPE_LABELS } from '../lib/utils';
import { fillerCounts, wordsPerMinute } from '../lib/speechStats';

export default function InterviewPractice() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const { data: iv, isLoading, error } = useInterview(id);
  const submit = useSubmitAnswer(id);
  const complete = useCompleteInterview(id);

  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [usedVoice, setUsedVoice] = useState(false);
  const [stats, setStats] = useState<{ wpm: number | null; fillers: Record<string, number> } | null>(null);
  const startedAt = useRef(Date.now());
  const initialised = useRef(false);

  useEffect(() => {
    if (iv && !initialised.current) {
      initialised.current = true;
      const firstOpen = iv.questions.findIndex((q) => !q.latestAnswer);
      setIdx(firstOpen === -1 ? 0 : firstOpen);
      startedAt.current = Date.now();
    }
  }, [iv]);

  if (isLoading) return <Spinner />;
  if (error || !iv) return <ErrorBox>{errMsg(error ?? new Error('Interview not found'))}</ErrorBox>;
  if (iv.status !== 'in_progress') return <Navigate to={`/interviews/${iv.id}/summary`} replace />;

  const q = iv.questions[idx];
  const total = iv.questions.length;
  const isLast = idx === total - 1;
  const answeredCount = iv.questions.filter((x) => x.latestAnswer).length;
  const busy = submit.isPending || complete.isPending;

  const send = () => {
    const seconds = Math.min(3600, Math.round((Date.now() - startedAt.current) / 1000));
    const answerText = text.trim();
    submit.mutate(
      { questionId: q.id, answerText, durationSeconds: seconds, inputMode: usedVoice ? 'voice' : 'text' },
      {
        onSuccess: (r) => {
          setResult(r);
          setStats(usedVoice ? { wpm: wordsPerMinute(r.answer.wordCount, seconds), fillers: fillerCounts(answerText) } : null);
        },
      },
    );
  };

  const reset = (keepText: boolean) => {
    setResult(null);
    setStats(null);
    submit.reset();
    if (!keepText) {
      setText('');
      setUsedVoice(false);
    }
    startedAt.current = Date.now();
  };

  const next = () => {
    reset(false);
    setIdx(idx + 1);
  };

  const finish = () => complete.mutate(undefined, { onSuccess: () => nav(`/interviews/${id}/summary`) });

  const fillerList = stats ? Object.entries(stats.fillers) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>{iv.jobRole}{iv.companyName ? ` at ${iv.companyName}` : ''}</span>
        <span>Question {idx + 1} of {total}, {answeredCount} answered</span>
      </div>
      <div className="mb-6 flex gap-1" aria-hidden>
        {iv.questions.map((x, i) => (
          <span key={x.id} className={`h-1.5 flex-1 rounded-full ${i === idx ? 'bg-pine' : x.latestAnswer ? 'bg-pine/40' : 'bg-line'}`} />
        ))}
      </div>

      <section className={`${sheet} p-6`}>
        <p className="mb-3 text-sm font-medium text-muted">{TYPE_LABELS[q.type] ?? q.type} question</p>
        <h1 className="font-serif text-2xl font-semibold leading-snug md:text-3xl">
          <span className="bg-marker/70 px-1 [box-decoration-break:clone]">{q.text}</span>
        </h1>

        {!result && (
          <div className="mt-6 space-y-3">
            <label htmlFor="answer" className="sr-only">Your answer</label>
            <textarea
              id="answer"
              rows={9}
              className={input}
              placeholder="Answer as you would in the room. Aim for one to two minutes."
              value={text}
              maxLength={5000}
              onChange={(e) => setText(e.target.value)}
              disabled={busy}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <VoiceRecorder value={text} onChange={setText} onUsed={() => setUsedVoice(true)} disabled={busy} />
              <span className="text-xs text-muted">{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
            </div>
            {submit.error && <ErrorBox>{errMsg(submit.error)} Your answer is still here, so you can try again.</ErrorBox>}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button className={btn} onClick={send} disabled={busy || text.trim().length < 10}>
                {submit.isPending ? 'Scoring your answer…' : 'Submit answer'}
              </button>
              {!isLast && !submit.isPending && (
                <button className={btnGhost} onClick={next} disabled={busy}>Skip question</button>
              )}
              {answeredCount > 0 && !submit.isPending && (
                <button className="text-sm font-medium text-muted underline" onClick={finish} disabled={busy}>Finish interview now</button>
              )}
            </div>
          </div>
        )}
      </section>

      {result && (
        <section className={`${sheet} mt-6 p-6`} aria-live="polite">
          <h2 className="mb-5 font-serif text-xl font-semibold">Your feedback</h2>
          <FeedbackCard feedback={result.feedback} />
          {stats && (
            <p className="mt-5 rounded-md bg-desk/60 px-3 py-2 text-sm text-muted">
              {stats.wpm != null && <>Pace: about {stats.wpm} words per minute (conversational speech is roughly 120-160). </>}
              {fillerList.length > 0
                ? <>Filler words heard: {fillerList.map(([w, n]) => `${w} ×${n}`).join(', ')}.</>
                : <>No filler words detected in the transcript.</>}
            </p>
          )}
          {complete.error && <div className="mt-4"><ErrorBox>{errMsg(complete.error)}</ErrorBox></div>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button className={btnGhost} onClick={() => reset(true)} disabled={busy}>Try this question again</button>
            {isLast
              ? <button className={btn} onClick={finish} disabled={busy}>{complete.isPending ? 'Building your summary…' : 'Finish and see summary'}</button>
              : <button className={btn} onClick={next} disabled={busy}>Next question</button>}
          </div>
        </section>
      )}
    </div>
  );
}
