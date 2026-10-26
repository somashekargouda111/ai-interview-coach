import type { ErrorRequestHandler, RequestHandler, Response } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

const send = (res: Response, status: number, code: string, message: string, details?: unknown) =>
  res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });

export const routeNotFound: RequestHandler = (_req, _res, next) =>
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) return send(res, err.status, err.code, err.message, err.details);

  if (err instanceof ZodError) {
    const first = err.issues[0];
    const field = first?.path.join('.');
    return send(
      res,
      400,
      'VALIDATION_ERROR',
      first ? `${field ? field + ': ' : ''}${first.message}` : 'Invalid input',
      err.issues.map((i) => ({ field: i.path.join('.'), issue: i.message })),
    );
  }

  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File is larger than 5 MB' : err.message;
    return send(res, 400, 'VALIDATION_ERROR', msg);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return send(res, 409, 'CONFLICT', 'That record already exists');
    if (err.code === 'P2025') return send(res, 404, 'NOT_FOUND', 'Record not found');
  }

  if (err?.type === 'entity.too.large') return send(res, 413, 'VALIDATION_ERROR', 'Request body is too large');
  if (err?.type === 'entity.parse.failed') return send(res, 400, 'VALIDATION_ERROR', 'Malformed JSON body');

  console.error(err);
  return send(res, 500, 'INTERNAL_ERROR', 'Something went wrong on our side');
};
