import { formatPrice, stockLabel } from './format';

describe('formatPrice', () => {
  it('formats whole and fractional amounts as dollars', () => {
    expect(formatPrice(21500)).toBe('$21,500');
    expect(formatPrice(19999.99)).toBe('$19,999.99');
  });
});

describe('stockLabel', () => {
  it.each([
    [0, 'Sold out', 'out'],
    [1, 'Last one', 'low'],
    [2, 'Only 2 left', 'low'],
    [3, 'Only 3 left', 'low'],
    [9, '9 in stock', 'ok'],
  ])('describes %i units as "%s" (%s)', (quantity, text, level) => {
    expect(stockLabel(quantity)).toEqual({ text, level });
  });
});
