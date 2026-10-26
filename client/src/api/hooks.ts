import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type {
  Categories, InterviewDetail, InterviewListItem, InterviewType, Overview, Paginated, Resume,
  SubmitResult, SummaryResponse, TrendPoint,
} from './types';

export const useResumes = () =>
  useQuery({ queryKey: ['resumes'], queryFn: () => api<{ data: Resume[] }>('/resumes').then((r) => r.data) });

export function useCreateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { text?: string; file?: File }) => {
      if (input.file) {
        const form = new FormData();
        form.append('file', input.file);
        return api<Resume>('/resumes', { method: 'POST', form });
      }
      return api<Resume>('/resumes', { method: 'POST', body: { text: input.text } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
}

export interface CreateInterviewInput {
  resumeId?: string | null;
  jobRole?: string;
  companyName?: string;
  jobDescription?: string;
  interviewType: InterviewType;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  numQuestions: number;
}

export function useCreateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInterviewInput) =>
      api<{ id: string }>('/interviews', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  });
}

export const useInterviews = (p: { page: number; limit: number; type?: string; status?: string }) => {
  const qs = new URLSearchParams({ page: String(p.page), limit: String(p.limit) });
  if (p.type) qs.set('type', p.type);
  if (p.status) qs.set('status', p.status);
  return useQuery({
    queryKey: ['interviews', p],
    queryFn: () => api<Paginated<InterviewListItem>>(`/interviews?${qs}`),
  });
};

export const useInterview = (id: string) =>
  useQuery({ queryKey: ['interview', id], queryFn: () => api<InterviewDetail>(`/interviews/${id}`) });

export function useSubmitAnswer(interviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { questionId: string; answerText: string; durationSeconds: number; inputMode: 'text' | 'voice' }) =>
      api<SubmitResult>(`/questions/${v.questionId}/answers`, {
        method: 'POST',
        body: { answerText: v.answerText, durationSeconds: v.durationSeconds, inputMode: v.inputMode },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interview', interviewId] }),
  });
}

export function useCompleteInterview(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<SummaryResponse>(`/interviews/${id}/complete`, { method: 'POST' }),
    onSuccess: (data) => {
      qc.setQueryData(['summary', id], data);
      qc.invalidateQueries({ queryKey: ['interview', id] });
      qc.invalidateQueries({ queryKey: ['interviews'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export const useSummary = (id: string) =>
  useQuery({ queryKey: ['summary', id], queryFn: () => api<SummaryResponse>(`/interviews/${id}/summary`) });

export function useDeleteInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/interviews/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export const useOverview = () => useQuery({ queryKey: ['progress', 'overview'], queryFn: () => api<Overview>('/progress/overview') });
export const useTrend = (days = 90) =>
  useQuery({ queryKey: ['progress', 'trend', days], queryFn: () => api<{ points: TrendPoint[] }>(`/progress/trend?days=${days}`).then((r) => r.points) });
export const useCategories = () => useQuery({ queryKey: ['progress', 'categories'], queryFn: () => api<Categories>('/progress/categories') });
