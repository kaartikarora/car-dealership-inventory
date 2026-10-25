import { useState } from 'react';
import type { Vehicle } from '../../lib/types';
import { DeleteDialog } from './DeleteDialog';
import { RestockDialog } from './RestockDialog';
import { VehicleFormDialog } from './VehicleFormDialog';

type Open = 'edit' | 'restock' | 'delete' | null;

// Edit, restock and delete controls shown on each card for admins.
export function AdminActions({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState<Open>(null);
  const close = () => setOpen(null);
  const name = `${vehicle.make} ${vehicle.model}`;
  const action = 'rounded-md px-2 py-1 text-xs font-semibold text-ink-soft hover:bg-ink/5';

  return (
    <div className="flex items-center gap-1 border-t border-line px-4 py-2">
      <span className="mr-auto text-[11px] font-semibold tracking-wider text-muted uppercase">Admin</span>
      <button className={action} aria-label={`Edit ${name}`} onClick={() => setOpen('edit')}>Edit</button>
      <button className={action} aria-label={`Restock ${name}`} onClick={() => setOpen('restock')}>Restock</button>
      <button className={`${action} text-danger hover:bg-danger/5`} aria-label={`Delete ${name}`} onClick={() => setOpen('delete')}>Delete</button>

      {open === 'edit' && <VehicleFormDialog vehicle={vehicle} onClose={close} />}
      {open === 'restock' && <RestockDialog vehicle={vehicle} onClose={close} />}
      {open === 'delete' && <DeleteDialog vehicle={vehicle} onClose={close} />}
    </div>
  );
}
