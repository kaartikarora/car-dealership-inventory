import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { VehicleFilters } from '../../lib/types';
import { vehicleKeys, vehiclesApi } from './vehiclesApi';

// keepPreviousData keeps the current grid on screen while a new search loads, so it never flashes empty.
export function useVehicles(filters: VehicleFilters) {
  return useQuery({
    queryKey: vehicleKeys.list(filters),
    queryFn: () => vehiclesApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
