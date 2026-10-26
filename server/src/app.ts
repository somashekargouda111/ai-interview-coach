import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, routeNotFound } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { resumeRoutes } from './modules/resumes/resumes.routes';
import { interviewRoutes } from './modules/interviews/interviews.routes';
import { answerRoutes } from './modules/answers/answers.routes';
import { progressRoutes } from './modules/progress/progress.routes';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '200kb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

const api = express.Router();
api.use('/auth', authRoutes);
api.use('/resumes', resumeRoutes);
api.use('/interviews', interviewRoutes);
api.use('/questions', answerRoutes);
api.use('/progress', progressRoutes);
app.use('/api/v1', api);

app.use(routeNotFound);
app.use(errorHandler);
