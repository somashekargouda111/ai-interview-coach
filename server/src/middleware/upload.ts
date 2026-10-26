import multer from 'multer';
import { AppError } from '../utils/AppError';

const ALLOWED = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.has(file.mimetype)
      ? cb(null, true)
      : cb(new AppError(400, 'VALIDATION_ERROR', 'Only PDF, DOCX or TXT files are allowed')),
}).single('file');
