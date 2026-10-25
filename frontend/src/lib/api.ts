import { session } from './session';

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

interface ErrorBody {
  error?: { code?: string; message?: string; details?: { field: string; message: string }[] };
}

// Every failed request becomes an ApiError, so components handle one error type.
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

type UnauthorizedListener = (message: string) => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

/** Subscribe to 401 responses (expired or invalid token). Returns an unsubscribe function. */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = session.token();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Could not reach the server. Check your connection and try again.');
  }

  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as T & ErrorBody;
  if (res.ok) return data;

  const { code = 'UNKNOWN', message = 'Something went wrong', details = [] } = data.error ?? {};
  if (res.status === 401) unauthorizedListeners.forEach((listener) => listener(message));
  const fieldErrors = Object.fromEntries(details.map((d) => [d.field, d.message]));
  throw new ApiError(res.status, code, message, fieldErrors);
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
};
