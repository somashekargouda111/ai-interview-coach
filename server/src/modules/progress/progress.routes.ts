import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth, uid } from '../../middleware/auth';
import * as svc from './progress.service';

const trendQuery = z.object({ days: z.coerce.number().int().min(7).max(730).default(90) });

export const progressRoutes = Router();
progressRoutes.use(requireAuth);

progressRoutes.get('/overview', asyncHandler(async (req, res) => res.json(await svc.overview(uid(req)))));
progressRoutes.get('/trend', asyncHandler(async (req, res) => {
  res.json(await svc.trend(uid(req), trendQuery.parse(req.query).days));
}));
progressRoutes.get('/categories', asyncHandler(async (req, res) => res.json(await svc.categories(uid(req)))));
