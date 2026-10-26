export const TYPE_LABELS: Record<string, string> = {
  hr: 'HR', behavioral: 'Behavioral', technical: 'Technical', system_design: 'System design', mixed: 'Mixed',
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');
