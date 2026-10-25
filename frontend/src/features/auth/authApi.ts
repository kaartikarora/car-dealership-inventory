import { api } from '../../lib/api';
import type { AuthResult } from '../../lib/types';

export interface Credentials { email: string; password: string }
export interface Registration extends Credentials { name: string }

export const authApi = {
  login: (body: Credentials) => api.post<AuthResult>('/auth/login', body),
  register: (body: Registration) => api.post<AuthResult>('/auth/register', body),
};
