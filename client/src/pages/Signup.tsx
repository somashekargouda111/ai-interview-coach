import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { btn, ErrorBox, input, label } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../lib/utils';

const LEVELS = [
  ['student', 'Student'], ['entry', 'Entry level'], ['junior', 'Junior'], ['mid', 'Mid level'], ['senior', 'Senior'], ['lead', 'Lead / manager'],
];

export default function Signup() {
  const { user, signup } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ fullName: '', email: '', password: '', targetRole: '', experienceLevel: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signup({
        fullName: f.fullName,
        email: f.email,
        password: f.password,
        targetRole: f.targetRole || undefined,
        experienceLevel: f.experienceLevel || undefined,
      });
      nav('/', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" sub="Practice with questions built from your own resume.">
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorBox>{error}</ErrorBox>}
        <div>
          <label htmlFor="name" className={label}>Full name</label>
          <input id="name" required minLength={2} autoComplete="name" className={input} value={f.fullName} onChange={set('fullName')} />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" type="email" required autoComplete="email" className={input} value={f.email} onChange={set('email')} />
        </div>
        <div>
          <label htmlFor="password" className={label}>Password</label>
          <input id="password" type="password" required minLength={8} autoComplete="new-password" className={input} value={f.password} onChange={set('password')} />
          <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="role" className={label}>Target role <span className="font-normal text-muted">(optional)</span></label>
            <input id="role" className={input} placeholder="Backend Engineer" value={f.targetRole} onChange={set('targetRole')} />
          </div>
          <div>
            <label htmlFor="level" className={label}>Experience <span className="font-normal text-muted">(optional)</span></label>
            <select id="level" className={input} value={f.experienceLevel} onChange={set('experienceLevel')}>
              <option value="">Select…</option>
              {LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        <button className={`${btn} w-full`} disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="mt-5 text-sm text-muted">
        Already registered? <Link to="/login" className="font-medium text-pine underline">Log in</Link>
      </p>
    </AuthShell>
  );
}
