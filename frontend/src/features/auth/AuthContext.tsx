import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onUnauthorized } from '../../lib/api';
import { session } from '../../lib/session';
import type { AuthResult, User } from '../../lib/types';
import { useToast } from '../../components/Toast';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  signIn(result: AuthResult): void;
  signOut(): void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => session.load()?.user ?? null);
  const notify = useToast();

  const signIn = useCallback((result: AuthResult) => {
    session.save(result);
    setUser(result.user);
  }, []);

  const signOut = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  // An expired or rejected token anywhere in the app signs the user out.
  useEffect(
    () =>
      onUnauthorized((message) => {
        if (!session.load()) return;
        signOut();
        notify(message === 'Token expired' ? 'Your session expired. Please sign in again.' : 'Please sign in again.', 'info');
      }),
    [signOut, notify],
  );

  const value = useMemo(() => ({ user, isAdmin: user?.role === 'ADMIN', signIn, signOut }), [user, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
