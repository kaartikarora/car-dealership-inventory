import type { AuthResult } from './types';

const KEY = 'showroom.session';

// The signed-in session lives in localStorage so a refresh keeps the user signed in.
// The token is a short-lived JWT; the server re-checks it on every request.
export const session = {
  load(): AuthResult | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AuthResult) : null;
    } catch {
      return null;
    }
  },
  save(value: AuthResult) {
    localStorage.setItem(KEY, JSON.stringify(value));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
  token(): string | undefined {
    return this.load()?.token;
  },
};
