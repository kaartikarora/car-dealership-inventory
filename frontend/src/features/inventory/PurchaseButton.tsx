import { ApiError } from '../../lib/api';
import type { Vehicle } from '../../lib/types';
import { Button, Spinner } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { usePurchase } from './useInventoryMutations';

export function PurchaseButton({ vehicle }: { vehicle: Vehicle }) {
  const purchase = usePurchase();
  const notify = useToast();
  const soldOut = vehicle.quantity <= 0;
  const name = `${vehicle.make} ${vehicle.model}`;

  function buy() {
    purchase.mutate(vehicle.id, {
      onSuccess: () => notify(`You bought the ${name}. Enjoy the drive!`, 'success'),
      onError: (err) =>
        notify(err instanceof ApiError && err.code === 'OUT_OF_STOCK' ? `The ${name} just sold out.` : 'Purchase failed. Please try again.', 'error'),
    });
  }

  return (
    <Button onClick={buy} disabled={soldOut || purchase.isPending} className="w-full" aria-label={soldOut ? `${name} is sold out` : `Purchase ${name}`}>
      {purchase.isPending && <Spinner label="Purchasing" />}
      {soldOut ? 'Sold out' : 'Purchase'}
    </Button>
  );
}
