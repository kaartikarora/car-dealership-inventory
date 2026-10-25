import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { AuthController } from './auth.controller';
import { registerSchema } from './auth.schemas';

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post('/register', validate({ body: registerSchema }), controller.register);
  return router;
}
