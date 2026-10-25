import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { API, server } from '../../test/msw/server';
import { renderWithProviders } from '../../test/render';
import { makeVehicle } from '../../test/fixtures';
import DashboardPage from '../vehicles/DashboardPage';

const corolla = makeVehicle();

function renderAsAdmin() {
  server.use(http.get(`${API}/vehicles`, () => HttpResponse.json([corolla])));
  return renderWithProviders(<DashboardPage />, { as: 'ADMIN' });
}

describe('admin inventory management', () => {
  it('adds a vehicle through the form', async () => {
    let body: unknown;
    server.use(http.post(`${API}/vehicles`, async ({ request }) => { body = await request.json(); return HttpResponse.json(makeVehicle({ id: 'new' }), { status: 201 }); }));
    renderAsAdmin();
    await userEvent.click(await screen.findByRole('button', { name: /add vehicle/i }));
    const dialog = screen.getByRole('dialog', { name: /add a vehicle/i });
    await userEvent.type(within(dialog).getByLabelText(/make/i), 'Kia');
    await userEvent.type(within(dialog).getByLabelText(/model/i), 'Seltos');
    await userEvent.selectOptions(within(dialog).getByLabelText(/category/i), 'SUV');
    await userEvent.type(within(dialog).getByLabelText(/price/i), '23900.50');
    await userEvent.clear(within(dialog).getByLabelText(/quantity/i));
    await userEvent.type(within(dialog).getByLabelText(/quantity/i), '3');
    await userEvent.click(within(dialog).getByRole('button', { name: /add vehicle/i }));
    await waitFor(() => expect(body).toEqual({ make: 'Kia', model: 'Seltos', category: 'SUV', price: 23900.5, quantity: 3 }));
    expect(await screen.findByText(/kia seltos added/i)).toBeInTheDocument();
  });

  it('validates the form before sending', async () => {
    renderAsAdmin();
    await userEvent.click(await screen.findByRole('button', { name: /add vehicle/i }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /add vehicle/i }));
    expect(await within(dialog).findByText(/make is required/i)).toBeInTheDocument();
  });

  it('edits a vehicle with the form prefilled', async () => {
    let body: unknown;
    server.use(http.put(`${API}/vehicles/v1`, async ({ request }) => { body = await request.json(); return HttpResponse.json(corolla); }));
    renderAsAdmin();
    await userEvent.click(await screen.findByRole('button', { name: /edit toyota corolla/i }));
    const dialog = screen.getByRole('dialog', { name: /edit toyota corolla/i });
    const price = within(dialog).getByLabelText(/price/i);
    expect(price).toHaveValue(21500);
    await userEvent.clear(price);
    await userEvent.type(price, '20999');
    await userEvent.click(within(dialog).getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(body).toMatchObject({ price: 20999, make: 'Toyota' }));
  });

  it('restocks by the amount entered', async () => {
    let body: unknown;
    server.use(http.post(`${API}/vehicles/v1/restock`, async ({ request }) => { body = await request.json(); return HttpResponse.json(makeVehicle({ quantity: 9 })); }));
    renderAsAdmin();
    await userEvent.click(await screen.findByRole('button', { name: /restock toyota corolla/i }));
    const dialog = screen.getByRole('dialog', { name: /restock/i });
    await userEvent.clear(within(dialog).getByLabelText(/units to add/i));
    await userEvent.type(within(dialog).getByLabelText(/units to add/i), '5');
    await userEvent.click(within(dialog).getByRole('button', { name: /add stock/i }));
    await waitFor(() => expect(body).toEqual({ amount: 5 }));
  });

  it('deletes only after confirmation', async () => {
    let deleted = false;
    server.use(http.delete(`${API}/vehicles/v1`, () => { deleted = true; return new HttpResponse(null, { status: 204 }); }));
    renderAsAdmin();
    await userEvent.click(await screen.findByRole('button', { name: /delete toyota corolla/i }));
    const dialog = screen.getByRole('dialog', { name: /delete toyota corolla/i });
    expect(deleted).toBe(false);
    await userEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }));
    await waitFor(() => expect(deleted).toBe(true));
  });

  it('closes a dialog with Escape without saving', async () => {
    renderAsAdmin();
    await userEvent.click(await screen.findByRole('button', { name: /delete toyota corolla/i }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
