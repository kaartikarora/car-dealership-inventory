import { RequestHandler, Router } from 'express';
import { validate } from '../../middleware/validate';
import { AuthController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schemas';

export function authRoutes(controller: AuthController, loginLimiter: RequestHandler): Router {
  const router = Router();
  router.post('/register', validate({ body: registerSchema }), controller.register);
  router.post('/login', loginLimiter, validate({ body: loginSchema }), controller.login);
  return router;
}
