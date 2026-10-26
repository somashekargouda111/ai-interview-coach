import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'UNAUTHORIZED', 'Missing access token');
  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as jwt.JwtPayload;
    if (!payload.sub) throw new Error('no subject');
    req.userId = payload.sub;
    next();
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', 'Access token is invalid or expired');
  }
};

export const uid = (req: { userId?: string }) => req.userId as string;
