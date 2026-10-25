import { Request, Response } from 'express';
import { AuthService } from './auth.service';

// Translates HTTP to service calls and back. No business rules live here.
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  register = async (req: Request, res: Response) => {
    res.status(201).json(await this.auth.register(req.body));
  };

  login = async (req: Request, res: Response) => {
    res.json(await this.auth.login(req.body));
  };
}
