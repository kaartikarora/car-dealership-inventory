import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/render';
import { makeVehicle } from '../../test/fixtures';
import { VehicleCard } from './VehicleCard';

describe('VehicleCard', () => {
  it('shows make, model, category, price and stock', () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle({ quantity: 2 })} />, { as: 'USER' });
    expect(screen.getByRole('heading', { name: 'Toyota Corolla' })).toBeInTheDocument();
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText('$21,500')).toBeInTheDocument();
    expect(screen.getByText('Only 2 left')).toBeInTheDocument();
  });

  it('hides admin actions from customers', () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle()} />, { as: 'USER' });
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /restock/i })).not.toBeInTheDocument();
  });

  it('shows edit, restock and delete to admins', () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle()} />, { as: 'ADMIN' });
    expect(screen.getByRole('button', { name: /edit toyota corolla/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /restock toyota corolla/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete toyota corolla/i })).toBeInTheDocument();
  });
});
