import { RequestHandler } from 'express';
import { ZodType } from 'zod';
import { ValidationError } from '../shared/errors';

export interface RequestSchemas {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
}

// Validates and coerces request input before it reaches a controller.
// Controllers can then trust req.params, req.query and req.body completely.
export const validate = (schemas: RequestSchemas): RequestHandler => (req, _res, next) => {
  for (const key of ['params', 'query', 'body'] as const) {
    const schema = schemas[key];
    if (!schema) continue;

    const result = schema.safeParse(req[key]);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
      );
    }
    // Express 5 exposes req.query as a getter, so plain assignment would throw.
    Object.defineProperty(req, key, { value: result.data, writable: true, configurable: true });
  }
  next();
};
