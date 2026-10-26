import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';
import { validate } from '../../middleware/validate';
import { requireAuth, uid } from '../../middleware/auth';
import { aiLimiter } from '../../middleware/rateLimit';
import { resumeUpload } from '../../middleware/upload';
import { storage } from '../../storage';
import { extractText, normalizeText, MIN_CHARS } from './extractText';
import * as svc from './resumes.service';

const idParams = z.object({ id: z.string().uuid() });
const pastedBody = z.object({
  text: z.string().min(1).max(60000),
  fileName: z.string().trim().max(255).optional(),
});

export const resumeRoutes = Router();
resumeRoutes.use(requireAuth);

// multipart (field "file") OR JSON ({ text, fileName })
resumeRoutes.post('/', aiLimiter, resumeUpload, asyncHandler(async (req, res) => {
  if (req.file) {
    const text = await extractText(req.file.buffer, req.file.mimetype);
    const fileUrl = await storage.save(req.file.buffer, req.file.originalname);
    const created = await svc.createResume({ userId: uid(req), text, fileName: req.file.originalname.slice(0, 255), fileUrl });
    return void res.status(201).json(created);
  }
  const body = pastedBody.parse(req.body);
  const text = normalizeText(body.text);
  if (text.length < MIN_CHARS) throw new AppError(400, 'VALIDATION_ERROR', `Resume text must be at least ${MIN_CHARS} characters`);
  res.status(201).json(await svc.createResume({ userId: uid(req), text, fileName: body.fileName ?? 'Pasted resume' }));
}));

resumeRoutes.get('/', asyncHandler(async (req, res) => {
  res.json({ data: await svc.listResumes(uid(req)) });
}));

resumeRoutes.get('/:id', validate({ params: idParams }), asyncHandler(async (req, res) => {
  res.json(await svc.getResume(uid(req), req.params.id));
}));

resumeRoutes.patch('/:id/activate', validate({ params: idParams }), asyncHandler(async (req, res) => {
  res.json(await svc.activateResume(uid(req), req.params.id));
}));

resumeRoutes.delete('/:id', validate({ params: idParams }), asyncHandler(async (req, res) => {
  await svc.deleteResume(uid(req), req.params.id);
  res.status(204).end();
}));
