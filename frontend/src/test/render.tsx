import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthProvider } from '../features/auth/AuthContext';
import { ToastProvider } from '../components/Toast';
import { session } from '../lib/session';
import type { Role } from '../lib/types';

interface Options {
  route?: string;
  /** Sign in as this role before rendering. */
  as?: Role;
  /** Extra routes, e.g. to assert where a redirect lands. */
  routes?: Record<string, ReactElement>;
  path?: string;
}

export function renderWithProviders(ui: ReactElement, { route = '/', as, routes = {}, path = '*' }: Options = {}) {
  if (as) {
    session.save({ token: `token-${as}`, user: { id: 'u1', name: as === 'ADMIN' ? 'Ada Admin' : 'Cara Customer', email: 'x@x.com', role: as } });
  }
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              {Object.entries(routes).map(([p, el]) => <Route key={p} path={p} element={el} />)}
              <Route path={path} element={ui} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}
