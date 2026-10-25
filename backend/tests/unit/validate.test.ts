import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validate } from '../../src/middleware/validate';
import { errorHandler } from '../../src/middleware/errorHandler';
import { ValidationError } from '../../src/shared/errors';

describe('validate middleware', () => {
  const schema = { body: z.object({ price: z.coerce.number().positive() }) };

  it('replaces the body with the parsed, coerced values', () => {
    const req: any = { body: { price: '100' } };
    const next = jest.fn();
    validate(schema)(req, {} as any, next);
    expect(req.body.price).toBe(100);
    expect(next).toHaveBeenCalledWith();
  });

  it('throws a ValidationError listing each failing field', () => {
    const req: any = { body: { price: -1 } };
    try {
      validate(schema)(req, {} as any, jest.fn());
      fail('expected a ValidationError');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).details).toEqual([expect.objectContaining({ field: 'price' })]);
    }
  });

  it('can replace req.query on a real Express 5 request', async () => {
    const app = express();
    app.get('/q', validate({ query: z.object({ min: z.coerce.number() }) }), (req, res) => {
      res.json({ type: typeof (req.query as any).min });
    });
    app.use(errorHandler);
    const res = await request(app).get('/q?min=5');
    expect(res.body.type).toBe('number');
  });

  it('responds 400 with details through the error handler', async () => {
    const app = express();
    app.use(express.json());
    app.post('/p', validate(schema), (_req, res) => { res.end(); });
    app.use(errorHandler);
    const res = await request(app).post('/p').send({ price: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details[0].field).toBe('price');
  });
});
