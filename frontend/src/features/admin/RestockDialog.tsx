import { useState, type FormEvent } from 'react';
import { ApiError } from '../../lib/api';
import type { Vehicle } from '../../lib/types';
import { Modal } from '../../components/Modal';
import { Button, Field, FormError, Input, Spinner } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { useRestock } from '../inventory/useInventoryMutations';

export function RestockDialog({ vehicle, onClose }: { vehicle: Vehicle; onClose(): void }) {
  const [amount, setAmount] = useState('1');
  const [error, setError] = useState<string>();
  const restock = useRestock();
  const notify = useToast();
  const n = Number(amount);
  const valid = Number.isInteger(n) && n >= 1 && n <= 10_000;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return setError('Enter a whole number from 1 to 10,000');
    restock.mutate(
      { id: vehicle.id, amount: n },
      {
        onSuccess: (updated) => {
          notify(`${updated.make} ${updated.model} now has ${updated.quantity} in stock`, 'success');
          onClose();
        },
        onError: (err) => setError(err instanceof ApiError ? err.message : 'Restock failed'),
      },
    );
  }

  return (
    <Modal title={`Restock ${vehicle.make} ${vehicle.model}`} description={`Currently ${vehicle.quantity} in stock.`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <Field label="Units to add" htmlFor="amount">
          <Input id="amount" type="number" min={1} max={10000} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={!valid} />
        </Field>
        {valid && <p className="text-sm text-muted">Stock after restock: <strong className="text-ink">{vehicle.quantity + n}</strong></p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={restock.isPending}>{restock.isPending && <Spinner label="Restocking" />}Add stock</Button>
        </div>
      </form>
    </Modal>
  );
}
