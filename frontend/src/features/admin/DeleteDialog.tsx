import type { Vehicle } from '../../lib/types';
import { Modal } from '../../components/Modal';
import { Button, Spinner } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { useDeleteVehicle } from './useVehicleMutations';

export function DeleteDialog({ vehicle, onClose }: { vehicle: Vehicle; onClose(): void }) {
  const remove = useDeleteVehicle();
  const notify = useToast();
  const name = `${vehicle.make} ${vehicle.model}`;

  function confirm() {
    remove.mutate(vehicle.id, {
      onSuccess: () => {
        notify(`${name} removed from the showroom`, 'success');
        onClose();
      },
      onError: () => notify(`Could not delete the ${name}`, 'error'),
    });
  }

  return (
    <Modal title={`Delete ${name}?`} description="This removes the listing permanently. It cannot be undone." onClose={onClose}>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" type="submit" onClick={confirm} disabled={remove.isPending}>{remove.isPending && <Spinner label="Deleting" />}Delete</Button>
      </div>
    </Modal>
  );
}
