export type InterviewType = 'hr' | 'behavioral' | 'technical' | 'system_design' | 'mixed';

export interface User { id: string; fullName: string; email: string; targetRole: string | null; experienceLevel: string | null }
export interface Resume { id: string; fileName: string | null; skills: string[]; isActive: boolean; createdAt: string; preview: string }

export interface StarPart { present: boolean; feedback: string }
export interface Star { situation: StarPart; task: StarPart; action: StarPart; result: StarPart; starScore: number }
export interface Scores { relevance: number; clarity: number; structure: number; specificity: number; confidence: number }
export interface Feedback {
  overallScore: number;
  scores: Scores;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  improvedAnswer: string | null;
  starAnalysis: Star | null;
}
export interface AnswerDto {
  id: string; attemptNumber: number; answerText: string; wordCount: number;
  durationSeconds: number | null; submittedAt: string; feedback: Feedback | null;
}
export interface SubmitResult { answer: { id: string; attemptNumber: number; wordCount: number; submittedAt: string }; feedback: Feedback }

export interface QuestionDto { id: string; order: number; type: string; text: string; attemptCount: number; latestAnswer: AnswerDto | null }
export interface InterviewDetail {
  id: string; jobRole: string; companyName: string | null; interviewType: InterviewType; difficultyLevel: string;
  status: 'in_progress' | 'completed' | 'abandoned'; startedAt: string; completedAt: string | null; questions: QuestionDto[];
}
export interface InterviewListItem {
  id: string; jobRole: string; companyName: string | null; interviewType: InterviewType; difficultyLevel: string;
  status: 'in_progress' | 'completed' | 'abandoned'; questionCount: number; overallScore: number | null; startedAt: string; completedAt: string | null;
}
export interface Paginated<T> { data: T[]; pagination: { page: number; limit: number; total: number } }

export interface SummaryResponse {
  interviewId: string; status: string;
  summary: {
    overallScore: number;
    categoryScores: { content: number | null; structure: number | null; communication: number | null; technical: number | null };
    totalQuestions: number; answeredQuestions: number;
    strengths: string[]; weaknesses: string[]; recommendedActions: string[];
  };
}
export interface Overview { totalInterviews: number; completedInterviews: number; totalAnswers: number; averageScore: number | null; bestScore: number | null; streakDays: number }
export interface TrendPoint { date: string; overallScore: number; interviewId: string; jobRole: string; interviewType: string }
export interface Categories { averages: Partial<Scores>; weakestCategory: string | null }
