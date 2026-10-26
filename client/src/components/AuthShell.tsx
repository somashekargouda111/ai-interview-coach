import type { ReactNode } from 'react';

export default function AuthShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <p className="mb-6 font-serif text-xl font-semibold">Interview Coach</p>
        <div className="rounded-lg border border-line bg-sheet p-7 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-muted">{sub}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
