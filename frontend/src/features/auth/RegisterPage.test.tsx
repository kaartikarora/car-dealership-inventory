import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { API, server } from '../../test/msw/server';
import { renderWithProviders } from '../../test/render';
import { session } from '../../lib/session';
import RegisterPage from './RegisterPage';

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText(/full name/i), 'Cara Customer');
  await userEvent.type(screen.getByLabelText(/email/i), 'cara@x.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'long-enough-pass');
  await userEvent.click(screen.getByRole('button', { name: /create account/i }));
}

describe('RegisterPage', () => {
  it('creates the account, signs in and opens the showroom', async () => {
    server.use(http.post(`${API}/auth/register`, () => HttpResponse.json({ token: 'tok', user: { id: 'u1', name: 'Cara Customer', email: 'cara@x.com', role: 'USER' } }, { status: 201 })));
    renderWithProviders(<RegisterPage />, { route: '/register', path: '/register', routes: { '/': <p>Showroom home</p> } });
    await fillAndSubmit();
    expect(await screen.findByText('Showroom home')).toBeInTheDocument();
    expect(session.load()?.user.name).toBe('Cara Customer');
  });

  it('puts a taken email error on the email field', async () => {
    server.use(http.post(`${API}/auth/register`, () => HttpResponse.json({ error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists' } }, { status: 409 })));
    renderWithProviders(<RegisterPage />, { route: '/register', path: '/register' });
    await fillAndSubmit();
    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('rejects a short password before calling the API', async () => {
    renderWithProviders(<RegisterPage />, { route: '/register', path: '/register' });
    await userEvent.type(screen.getByLabelText(/password/i), 'short');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});
