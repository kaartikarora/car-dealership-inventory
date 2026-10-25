import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { API, server } from '../../test/msw/server';
import { renderWithProviders } from '../../test/render';
import { session } from '../../lib/session';
import LoginPage from './LoginPage';

const user = { id: 'u1', name: 'Cara', email: 'cara@x.com', role: 'USER' };

function renderLogin() {
  return renderWithProviders(<LoginPage />, { route: '/login', path: '/login', routes: { '/': <p>Showroom home</p> } });
}

describe('LoginPage', () => {
  it('signs in, stores the session and goes to the showroom', async () => {
    server.use(http.post(`${API}/auth/login`, () => HttpResponse.json({ token: 'tok', user })));
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'cara@x.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret-pass');
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByText('Showroom home')).toBeInTheDocument();
    expect(session.load()?.token).toBe('tok');
  });

  it('shows the server message when credentials are wrong', async () => {
    server.use(http.post(`${API}/auth/login`, () => HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } }, { status: 401 })));
    renderLogin();
    await userEvent.type(screen.getByLabelText(/email/i), 'cara@x.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-pass');
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(session.load()).toBeNull();
  });

  it('validates fields before calling the API', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('offers one-click demo logins', async () => {
    let sent: unknown;
    server.use(http.post(`${API}/auth/login`, async ({ request }) => { sent = await request.json(); return HttpResponse.json({ token: 't', user: { ...user, role: 'ADMIN' } }); }));
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /demo admin/i }));
    await waitFor(() => expect(sent).toEqual({ email: 'admin@demo.test', password: 'demo-admin-pass' }));
  });
});
