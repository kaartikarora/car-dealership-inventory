import { http, HttpResponse } from 'msw';
import { API, server } from '../test/msw/server';
import { ApiError, api, onUnauthorized } from './api';
import { session } from './session';

describe('api client', () => {
  it('sends JSON and the stored bearer token', async () => {
    session.save({ token: 'tok-123', user: { id: '1', name: 'A', email: 'a@x.com', role: 'USER' } });
    let seen: { auth: string | null; body: unknown } | undefined;
    server.use(
      http.post(`${API}/echo`, async ({ request }) => {
        seen = { auth: request.headers.get('authorization'), body: await request.json() };
        return HttpResponse.json({ ok: true });
      }),
    );
    await expect(api.post('/echo', { a: 1 })).resolves.toEqual({ ok: true });
    expect(seen).toEqual({ auth: 'Bearer tok-123', body: { a: 1 } });
  });

  it('throws an ApiError carrying the server code, message and field details', async () => {
    server.use(
      http.post(`${API}/fail`, () =>
        HttpResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: [{ field: 'price', message: 'Too low' }] } }, { status: 400 }),
      ),
    );
    const err = await api.post<never>('/fail', {}).catch((e: unknown) => e as ApiError);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 400, code: 'VALIDATION_ERROR', message: 'Invalid request' });
    expect(err.fieldErrors).toEqual({ price: 'Too low' });
  });

  it('returns undefined for 204 No Content', async () => {
    server.use(http.delete(`${API}/thing`, () => new HttpResponse(null, { status: 204 })));
    await expect(api.delete('/thing')).resolves.toBeUndefined();
  });

  it('notifies listeners on 401 so the app can sign the user out', async () => {
    const listener = vi.fn();
    const stop = onUnauthorized(listener);
    server.use(http.get(`${API}/secret`, () => HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Token expired' } }, { status: 401 })));
    await api.get('/secret').catch(() => {});
    expect(listener).toHaveBeenCalledWith('Token expired');
    stop();
  });

  it('turns a network failure into a friendly ApiError', async () => {
    server.use(http.get(`${API}/down`, () => HttpResponse.error()));
    await expect(api.get('/down')).rejects.toMatchObject({ code: 'NETWORK', message: expect.stringMatching(/reach the server/) });
  });
});
