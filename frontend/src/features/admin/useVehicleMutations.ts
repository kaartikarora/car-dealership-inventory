import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { VehicleInput } from '../../lib/types';
import { vehicleKeys, vehiclesApi } from '../vehicles/vehiclesApi';

function useInvalidate() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: vehicleKeys.all });
}

export function useCreateVehicle() {
  const onSettled = useInvalidate();
  return useMutation({ mutationFn: vehiclesApi.create, onSettled });
}

export function useUpdateVehicle(id: string) {
  const onSettled = useInvalidate();
  return useMutation({ mutationFn: (input: VehicleInput) => vehiclesApi.update(id, input), onSettled });
}

export function useDeleteVehicle() {
  const onSettled = useInvalidate();
  return useMutation({ mutationFn: vehiclesApi.remove, onSettled });
}
