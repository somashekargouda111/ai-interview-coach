import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/** Validates and replaces req.body / req.params with parsed (trimmed, coerced) values. */
export const validate =
  (schemas: { body?: ZodTypeAny; params?: ZodTypeAny }): RequestHandler =>
  (req, _res, next) => {
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.body) req.body = schemas.body.parse(req.body);
    next();
  };
