import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleKeys, vehiclesApi } from '../vehicles/vehiclesApi';

// After any stock or catalogue change, refetch every vehicle list so all views agree with the server.
function useInvalidateVehicles() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: vehicleKeys.all });
}

export function usePurchase() {
  const invalidate = useInvalidateVehicles();
  return useMutation({ mutationFn: vehiclesApi.purchase, onSettled: invalidate });
}

export function useRestock() {
  const invalidate = useInvalidateVehicles();
  return useMutation({ mutationFn: ({ id, amount }: { id: string; amount: number }) => vehiclesApi.restock(id, amount), onSettled: invalidate });
}
