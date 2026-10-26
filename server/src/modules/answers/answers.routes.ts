import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, uid } from '../../middleware/auth';
import { aiLimiter } from '../../middleware/rateLimit';
import * as svc from './answers.service';

const params = z.object({ questionId: z.string().uuid() });
const body = z.object({
  answerText: z.string().trim().min(10, 'Answer is too short to evaluate').max(5000, 'Answer is limited to 5,000 characters'),
  durationSeconds: z.number().int().min(0).max(3600).optional(),
  inputMode: z.enum(['text', 'voice']).default('text'),
});

export const answerRoutes = Router();
answerRoutes.use(requireAuth);

answerRoutes.post('/:questionId/answers', aiLimiter, validate({ params, body }), asyncHandler(async (req, res) => {
  res.status(201).json(await svc.submitAnswer(uid(req), req.params.questionId, req.body));
}));

answerRoutes.get('/:questionId/answers', validate({ params }), asyncHandler(async (req, res) => {
  res.json(await svc.listAnswers(uid(req), req.params.questionId));
}));
