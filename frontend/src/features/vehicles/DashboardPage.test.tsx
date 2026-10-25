import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { API, server } from '../../test/msw/server';
import { renderWithProviders } from '../../test/render';
import { makeVehicle } from '../../test/fixtures';
import DashboardPage from './DashboardPage';

const inventory = [
  makeVehicle({ id: 'a', make: 'Toyota', model: 'Corolla', quantity: 3, price: 21500 }),
  makeVehicle({ id: 'b', make: 'Tesla', model: 'Model 3', category: 'EV', quantity: 0, price: 41000 }),
];

describe('DashboardPage', () => {
  it('lists every vehicle with a live summary', async () => {
    server.use(http.get(`${API}/vehicles`, () => HttpResponse.json(inventory)));
    renderWithProviders(<DashboardPage />, { as: 'USER' });
    expect(await screen.findByRole('heading', { name: 'Toyota Corolla' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tesla Model 3' })).toBeInTheDocument();
    expect(screen.getByText('2 models')).toBeInTheDocument();
    expect(screen.getByText('3 cars in stock')).toBeInTheDocument();
  });

  it('searches through the API when the user types', async () => {
    server.use(http.get(`${API}/vehicles`, () => HttpResponse.json(inventory)));
    let query = '';
    server.use(http.get(`${API}/vehicles/search`, ({ request }) => {
      query = new URL(request.url).search;
      return HttpResponse.json([inventory[1]]);
    }));
    renderWithProviders(<DashboardPage />, { as: 'USER' });
    await screen.findByRole('heading', { name: 'Toyota Corolla' });
    await userEvent.type(screen.getByRole('searchbox', { name: /search/i }), 'tesla');
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Toyota Corolla' })).not.toBeInTheDocument());
    expect(query).toBe('?q=tesla');
  });

  it('shows a helpful empty state when nothing matches', async () => {
    server.use(http.get(`${API}/vehicles`, () => HttpResponse.json(inventory)));
    server.use(http.get(`${API}/vehicles/search`, () => HttpResponse.json([])));
    renderWithProviders(<DashboardPage />, { as: 'USER' });
    await screen.findByRole('heading', { name: 'Toyota Corolla' });
    await userEvent.click(screen.getByRole('button', { name: 'EV' }));
    expect(await screen.findByText(/no cars match/i)).toBeInTheDocument();
  });

  it('shows an error with a retry when the API fails', async () => {
    server.use(http.get(`${API}/vehicles`, () => HttpResponse.json({ error: { code: 'INTERNAL', message: 'Something went wrong' } }, { status: 500 })));
    renderWithProviders(<DashboardPage />, { as: 'USER' });
    expect(await screen.findByText(/could not load the inventory/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
