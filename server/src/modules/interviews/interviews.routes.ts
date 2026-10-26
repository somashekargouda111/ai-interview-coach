import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, uid } from '../../middleware/auth';
import { aiLimiter } from '../../middleware/rateLimit';
import * as svc from './interviews.service';

const TYPES = ['hr', 'behavioral', 'technical', 'system_design', 'mixed'] as const;
const idParams = z.object({ id: z.string().uuid() });

const createBody = z
  .object({
    resumeId: z.string().uuid().nullable().optional(),
    jobRole: z.string().trim().min(1).max(150).optional(),
    companyName: z.string().trim().min(1).max(150).optional(),
    jobDescription: z.string().trim().min(1).max(8000).optional(),
    interviewType: z.enum(TYPES),
    difficultyLevel: z.enum(['easy', 'medium', 'hard']).default('medium'),
    numQuestions: z.number().int().min(3).max(15).default(8),
  })
  .refine((d) => d.jobRole || d.jobDescription, {
    message: 'Provide a job role or paste a job description',
    path: ['jobRole'],
  });

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  type: z.enum(TYPES).optional(),
  status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
});

export const interviewRoutes = Router();
interviewRoutes.use(requireAuth);

interviewRoutes.post('/', aiLimiter, validate({ body: createBody }), asyncHandler(async (req, res) => {
  res.status(201).json(await svc.createInterview(uid(req), req.body));
}));

interviewRoutes.get('/', asyncHandler(async (req, res) => {
  res.json(await svc.listInterviews(uid(req), listQuery.parse(req.query)));
}));

interviewRoutes.get('/:id', validate({ params: idParams }), asyncHandler(async (req, res) => {
  res.json(await svc.getInterview(uid(req), req.params.id));
}));

interviewRoutes.post('/:id/complete', aiLimiter, validate({ params: idParams }), asyncHandler(async (req, res) => {
  res.json(await svc.completeInterview(uid(req), req.params.id));
}));

interviewRoutes.get('/:id/summary', validate({ params: idParams }), asyncHandler(async (req, res) => {
  res.json(await svc.getSummary(uid(req), req.params.id));
}));

interviewRoutes.post('/:id/abandon', validate({ params: idParams }), asyncHandler(async (req, res) => {
  await svc.abandonInterview(uid(req), req.params.id);
  res.json({ id: req.params.id, status: 'abandoned' });
}));

interviewRoutes.delete('/:id', validate({ params: idParams }), asyncHandler(async (req, res) => {
  await svc.deleteInterview(uid(req), req.params.id);
  res.status(204).end();
}));
