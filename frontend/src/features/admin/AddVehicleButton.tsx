import { useState } from 'react';
import { Button } from '../../components/ui';
import { VehicleFormDialog } from './VehicleFormDialog';

export function AddVehicleButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className="bg-brand text-ink hover:bg-brand-strong" onClick={() => setOpen(true)}>+ Add vehicle</Button>
      {open && <VehicleFormDialog onClose={() => setOpen(false)} />}
    </>
  );
}
