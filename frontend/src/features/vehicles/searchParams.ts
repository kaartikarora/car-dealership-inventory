import type { VehicleFilters } from '../../lib/types';

/** Builds the query string for GET /vehicles/search, leaving out anything unset or default. */
export function toSearchQuery(filters: VehicleFilters): string {
  const params = new URLSearchParams();
  const q = filters.q?.trim();
  if (q) params.set('q', q);
  if (filters.category) params.set('category', filters.category);
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.inStock) params.set('inStock', 'true');
  if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
  return params.toString();
}

export const hasFilters = (filters: VehicleFilters) => toSearchQuery(filters) !== '';
