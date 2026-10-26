import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateInterview, useCreateResume, useResumes } from '../api/hooks';
import type { InterviewType } from '../api/types';
import { btn, ErrorBox, input, label, PageTitle, sheet, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../lib/utils';

const TYPES: { id: InterviewType; name: string; hint: string }[] = [
  { id: 'mixed', name: 'Mixed', hint: 'A realistic blend of everything' },
  { id: 'behavioral', name: 'Behavioral', hint: 'Past experience, STAR-style' },
  { id: 'technical', name: 'Technical', hint: 'Role-specific knowledge' },
  { id: 'system_design', name: 'System design', hint: 'Architecture and trade-offs' },
  { id: 'hr', name: 'HR', hint: 'Motivation and culture fit' },
];

export default function NewInterview() {
  const nav = useNavigate();
  const { user } = useAuth();
  const resumes = useResumes();
  const createResume = useCreateResume();
  const createInterview = useCreateInterview();

  const [resumeChoice, setResumeChoice] = useState<string>(''); // id | 'new' | 'none'
  const [pasted, setPasted] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState(user?.targetRole ?? '');
  const [company, setCompany] = useState('');
  const [jd, setJd] = useState('');
  const [type, setType] = useState<InterviewType>('mixed');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState(8);
  const [error, setError] = useState('');

  if (resumes.isLoading) return <Spinner />;
  const list = resumes.data ?? [];
  const choice = resumeChoice || (list.find((r) => r.isActive)?.id ?? (list.length ? list[0].id : 'new'));
  const busy = createResume.isPending || createInterview.isPending;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!jobRole.trim() && !jd.trim()) return setError('Enter a target role or paste a job description.');
    try {
      let resumeId: string | null | undefined;
      if (choice === 'none') resumeId = null;
      else if (choice === 'new') {
        if (!file && pasted.trim().length < 50) return setError('Paste your resume (at least 50 characters), upload a file, or choose "No resume".');
        resumeId = (await createResume.mutateAsync(file ? { file } : { text: pasted })).id;
      } else resumeId = choice;

      const created = await createInterview.mutateAsync({
        resumeId,
        jobRole: jobRole.trim() || undefined,
        companyName: company.trim() || undefined,
        jobDescription: jd.trim() || undefined,
        interviewType: type,
        difficultyLevel: difficulty,
        numQuestions: count,
      });
      nav(`/interviews/${created.id}/practice`);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <>
      <PageTitle sub="Questions are written from your resume and the job description, so the more you add, the sharper they get.">
        Set up an interview
      </PageTitle>
      <form onSubmit={submit} className="space-y-6">
        {error && <ErrorBox>{error}</ErrorBox>}

        <fieldset className={`${sheet} space-y-4 p-5`} disabled={busy}>
          <legend className="sr-only">Resume</legend>
          <h2 className="font-semibold">Your resume</h2>
          <div>
            <label htmlFor="resume" className={label}>Resume to use</label>
            <select id="resume" className={input} value={choice} onChange={(e) => setResumeChoice(e.target.value)}>
              {list.map((r) => <option key={r.id} value={r.id}>{r.fileName ?? 'Resume'}{r.isActive ? ' (active)' : ''}</option>)}
              <option value="new">Add a new resume…</option>
              <option value="none">No resume</option>
            </select>
          </div>
          {choice === 'new' && (
            <div className="space-y-3">
              <div>
                <label htmlFor="file" className={label}>Upload PDF, DOCX or TXT (max 5 MB)</label>
                <input id="file" type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
              </div>
              {!file && (
                <div>
                  <label htmlFor="paste" className={label}>Or paste the text</label>
                  <textarea id="paste" rows={7} className={input} value={pasted} onChange={(e) => setPasted(e.target.value)} />
                </div>
              )}
            </div>
          )}
        </fieldset>

        <fieldset className={`${sheet} space-y-4 p-5`} disabled={busy}>
          <legend className="sr-only">Target job</legend>
          <h2 className="font-semibold">The job</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="role" className={label}>Target role</label>
              <input id="role" className={input} value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="Backend Engineer" maxLength={150} />
            </div>
            <div>
              <label htmlFor="company" className={label}>Company <span className="font-normal text-muted">(optional)</span></label>
              <input id="company" className={input} value={company} onChange={(e) => setCompany(e.target.value)} maxLength={150} />
            </div>
          </div>
          <div>
            <label htmlFor="jd" className={label}>Job description <span className="font-normal text-muted">(optional)</span></label>
            <textarea id="jd" rows={6} className={input} value={jd} onChange={(e) => setJd(e.target.value)} maxLength={8000} />
          </div>
        </fieldset>

        <fieldset className={`${sheet} space-y-4 p-5`} disabled={busy}>
          <legend className="font-semibold">Interview type</legend>
          <div className="grid gap-2 sm:grid-cols-5">
            {TYPES.map((t) => (
              <label key={t.id} className={`cursor-pointer rounded-md border p-3 text-sm ${type === t.id ? 'border-pine bg-pine/5 ring-1 ring-pine' : 'border-line bg-white'}`}>
                <input type="radio" name="type" className="sr-only" checked={type === t.id} onChange={() => setType(t.id)} />
                <span className="block font-semibold">{t.name}</span>
                <span className="text-muted">{t.hint}</span>
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="diff" className={label}>Difficulty</label>
              <select id="diff" className={input} value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label htmlFor="count" className={label}>Number of questions: {count}</label>
              <input id="count" type="range" min={3} max={15} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full accent-pine" />
            </div>
          </div>
        </fieldset>

        <div className="flex items-center gap-4">
          <button className={btn} disabled={busy}>{busy ? 'Writing your questions…' : 'Generate questions'}</button>
          {busy && <span className="text-sm text-muted">This usually takes 10-20 seconds.</span>}
        </div>
      </form>
    </>
  );
}
