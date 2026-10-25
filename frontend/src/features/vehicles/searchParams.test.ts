import { toSearchQuery, hasFilters } from './searchParams';

describe('toSearchQuery', () => {
  it('includes only filters that are set', () => {
    expect(toSearchQuery({ q: ' civic ', category: 'SEDAN', minPrice: 1000, inStock: true, sort: 'price_asc' })).toBe(
      'q=civic&category=SEDAN&minPrice=1000&inStock=true&sort=price_asc',
    );
  });

  it('drops blanks and the default sort', () => {
    expect(toSearchQuery({ q: '  ', sort: 'newest', inStock: false })).toBe('');
  });
});

describe('hasFilters', () => {
  it('is false for an empty filter set and true when any filter applies', () => {
    expect(hasFilters({ sort: 'newest' })).toBe(false);
    expect(hasFilters({ maxPrice: 30000 })).toBe(true);
  });
});
