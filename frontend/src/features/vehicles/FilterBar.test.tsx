import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('reports price, sort and in-stock changes', async () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/minimum price/i), { target: { value: '20000' } });
    expect(onChange).toHaveBeenLastCalledWith({ minPrice: 20000 });
    await userEvent.selectOptions(screen.getByLabelText(/sort by/i), 'price_desc');
    expect(onChange).toHaveBeenLastCalledWith({ sort: 'price_desc' });
    await userEvent.click(screen.getByLabelText(/in stock only/i));
    expect(onChange).toHaveBeenLastCalledWith({ inStock: true });
  });

  it('clears a price when the box is emptied', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{ maxPrice: 30000 }} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/maximum price/i), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith({ maxPrice: undefined });
  });

  it('warns when the minimum is above the maximum', () => {
    render(<FilterBar filters={{ minPrice: 50000, maxPrice: 10000 }} onChange={vi.fn()} />);
    expect(screen.getByText(/minimum price is higher/i)).toBeInTheDocument();
  });

  it('toggles a category chip on and off', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<FilterBar filters={{}} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Truck' }));
    expect(onChange).toHaveBeenLastCalledWith({ category: 'TRUCK' });
    rerender(<FilterBar filters={{ category: 'TRUCK' }} onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Truck' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Truck' }));
    expect(onChange).toHaveBeenLastCalledWith({ category: undefined });
  });
});
