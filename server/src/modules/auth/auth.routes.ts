import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../middleware/validate';
import { requireAuth, uid } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimit';
import * as svc from './auth.service';

const LEVELS = ['student', 'entry', 'junior', 'mid', 'senior', 'lead'] as const;

const signupBody = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  targetRole: z.string().trim().max(150).optional(),
  experienceLevel: z.enum(LEVELS).optional(),
});

const loginBody = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required').max(72),
});

const profileBody = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  targetRole: z.string().trim().max(150).nullable().optional(),
  experienceLevel: z.enum(LEVELS).nullable().optional(),
});

export const authRoutes = Router();

authRoutes.post('/signup', authLimiter, validate({ body: signupBody }), asyncHandler(async (req, res) => {
  res.status(201).json(await svc.signup(req.body));
}));

authRoutes.post('/login', authLimiter, validate({ body: loginBody }), asyncHandler(async (req, res) => {
  res.json(await svc.login(req.body.email, req.body.password));
}));

authRoutes.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: await svc.getMe(uid(req)) });
}));

authRoutes.patch('/me', requireAuth, validate({ body: profileBody }), asyncHandler(async (req, res) => {
  res.json({ user: await svc.updateMe(uid(req), req.body) });
}));
