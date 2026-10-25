const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const formatPrice = (amount: number) => dollars.format(amount);

export type StockLevel = 'out' | 'low' | 'ok';

/** Human wording for stock, with a level the UI turns into a colour. */
export function stockLabel(quantity: number): { text: string; level: StockLevel } {
  if (quantity <= 0) return { text: 'Sold out', level: 'out' };
  if (quantity === 1) return { text: 'Last one', level: 'low' };
  if (quantity <= 3) return { text: `Only ${quantity} left`, level: 'low' };
  return { text: `${quantity} in stock`, level: 'ok' };
}

export const categoryLabel = (category: string) =>
  ({ SEDAN: 'Sedan', SUV: 'SUV', HATCHBACK: 'Hatchback', TRUCK: 'Truck', EV: 'Electric', COUPE: 'Coupe' })[category] ?? category;
