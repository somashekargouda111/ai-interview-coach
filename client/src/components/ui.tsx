import type { ReactNode } from 'react';

export const btn =
  'inline-flex items-center justify-center gap-2 rounded-md bg-pine px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pine-dark disabled:cursor-not-allowed disabled:opacity-50';
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-md border border-line bg-sheet px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-desk disabled:cursor-not-allowed disabled:opacity-50';
export const input =
  'w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-pine focus:outline-none';
export const label = 'mb-1.5 block text-sm font-medium text-ink';
export const sheet = 'rounded-lg border border-line bg-sheet';

export function Spinner({ text = 'Loading…' }: { text?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-10 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-pine" />
      {text}
    </div>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-md border border-flag/30 bg-flag/5 px-3 py-2.5 text-sm text-flag">
      {children}
    </div>
  );
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">{children}</h1>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}
