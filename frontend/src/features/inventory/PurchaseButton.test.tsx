import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { API, server } from '../../test/msw/server';
import { renderWithProviders } from '../../test/render';
import { makeVehicle } from '../../test/fixtures';
import { PurchaseButton } from './PurchaseButton';

describe('PurchaseButton', () => {
  it('is disabled and says "Sold out" when quantity is zero', () => {
    renderWithProviders(<PurchaseButton vehicle={makeVehicle({ quantity: 0 })} />, { as: 'USER' });
    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled();
  });

  it('is enabled when the vehicle is in stock', () => {
    renderWithProviders(<PurchaseButton vehicle={makeVehicle({ quantity: 2 })} />, { as: 'USER' });
    expect(screen.getByRole('button', { name: /purchase/i })).toBeEnabled();
  });

  it('buys the vehicle and confirms with a toast', async () => {
    server.use(http.post(`${API}/vehicles/v1/purchase`, () => HttpResponse.json(makeVehicle({ quantity: 1 }))));
    renderWithProviders(<PurchaseButton vehicle={makeVehicle({ quantity: 2 })} />, { as: 'USER' });
    await userEvent.click(screen.getByRole('button', { name: /purchase/i }));
    expect(await screen.findByText(/you bought the toyota corolla/i)).toBeInTheDocument();
  });

  it('explains when someone else bought the last one first', async () => {
    server.use(http.post(`${API}/vehicles/v1/purchase`, () => HttpResponse.json({ error: { code: 'OUT_OF_STOCK', message: 'This vehicle is out of stock' } }, { status: 409 })));
    server.use(http.get(`${API}/vehicles`, () => HttpResponse.json([])));
    renderWithProviders(<PurchaseButton vehicle={makeVehicle({ quantity: 1 })} />, { as: 'USER' });
    await userEvent.click(screen.getByRole('button', { name: /purchase/i }));
    expect(await screen.findByText(/just sold out/i)).toBeInTheDocument();
  });
});
