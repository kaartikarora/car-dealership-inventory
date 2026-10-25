import { api } from '../../lib/api';
import type { Vehicle, VehicleFilters, VehicleInput } from '../../lib/types';
import { toSearchQuery } from './searchParams';

export const vehiclesApi = {
  // No filters: the plain list endpoint. Any filter: the search endpoint.
  list: (filters: VehicleFilters = {}) => {
    const query = toSearchQuery(filters);
    return api.get<Vehicle[]>(query ? `/vehicles/search?${query}` : '/vehicles');
  },
  create: (input: VehicleInput) => api.post<Vehicle>('/vehicles', input),
  update: (id: string, input: Partial<VehicleInput>) => api.put<Vehicle>(`/vehicles/${id}`, input),
  remove: (id: string) => api.delete(`/vehicles/${id}`),
  purchase: (id: string) => api.post<Vehicle>(`/vehicles/${id}/purchase`),
  restock: (id: string, amount: number) => api.post<Vehicle>(`/vehicles/${id}/restock`, { amount }),
};

export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: (filters: VehicleFilters) => ['vehicles', toSearchQuery(filters)] as const,
};
