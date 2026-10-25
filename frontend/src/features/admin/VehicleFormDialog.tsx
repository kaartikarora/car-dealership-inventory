import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ApiError } from '../../lib/api';
import { categoryLabel } from '../../lib/format';
import { CATEGORIES, type Vehicle, type VehicleInput } from '../../lib/types';
import { Modal } from '../../components/Modal';
import { Button, Field, FormError, Input, Select, Spinner } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { useCreateVehicle, useUpdateVehicle } from './useVehicleMutations';

// Same rules as the API (backend/src/modules/vehicles/vehicle.schemas.ts).
const schema = z.object({
  make: z.string().trim().min(1, 'Make is required').max(60),
  model: z.string().trim().min(1, 'Model is required').max(60),
  category: z.enum(CATEGORIES, { error: 'Pick a category' }),
  price: z
    .number({ error: 'Enter a price' })
    .positive('Price must be greater than 0')
    .refine((n) => Number.isInteger(Math.round(n * 100)) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, 'At most 2 decimal places'),
  quantity: z.number({ error: 'Enter a quantity' }).int('Whole numbers only').min(0, 'Cannot be negative'),
});

interface Props {
  /** Present when editing; absent when adding. */
  vehicle?: Vehicle;
  onClose(): void;
}

export function VehicleFormDialog({ vehicle, onClose }: Props) {
  const notify = useToast();
  const create = useCreateVehicle();
  const update = useUpdateVehicle(vehicle?.id ?? '');
  const editing = Boolean(vehicle);

  const { register, handleSubmit, setError, formState } = useForm<VehicleInput>({
    resolver: zodResolver(schema),
    defaultValues: vehicle
      ? { make: vehicle.make, model: vehicle.model, category: vehicle.category, price: vehicle.price, quantity: vehicle.quantity }
      : { quantity: 1 },
  });

  async function onSubmit(values: VehicleInput) {
    try {
      const saved = editing ? await update.mutateAsync(values) : await create.mutateAsync(values);
      notify(`${saved.make} ${saved.model} ${editing ? 'updated' : 'added'}`, 'success');
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        Object.entries(err.fieldErrors).forEach(([field, message]) => setError(field as keyof VehicleInput, { message }));
        setError('root', { message: err.status === 404 ? 'This vehicle no longer exists.' : err.message });
      } else {
        setError('root', { message: 'Could not save the vehicle' });
      }
    }
  }

  const { errors, isSubmitting } = formState;
  const title = editing ? `Edit ${vehicle!.make} ${vehicle!.model}` : 'Add a vehicle';

  return (
    <Modal title={title} description={editing ? 'Update the listing details.' : 'List a new model on the showroom floor.'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError message={errors.root?.message} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Make" htmlFor="make" error={errors.make?.message}>
            <Input id="make" placeholder="Toyota" aria-invalid={!!errors.make} {...register('make')} />
          </Field>
          <Field label="Model" htmlFor="model" error={errors.model?.message}>
            <Input id="model" placeholder="Corolla" aria-invalid={!!errors.model} {...register('model')} />
          </Field>
        </div>
        <Field label="Category" htmlFor="category" error={errors.category?.message}>
          <Select id="category" aria-invalid={!!errors.category} {...register('category')} defaultValue={vehicle?.category ?? ''}>
            <option value="" disabled>Choose a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (USD)" htmlFor="price" error={errors.price?.message}>
            <Input id="price" type="number" step="0.01" min="0" inputMode="decimal" aria-invalid={!!errors.price} {...register('price', { valueAsNumber: true })} />
          </Field>
          <Field label="Quantity" htmlFor="quantity" error={errors.quantity?.message}>
            <Input id="quantity" type="number" step="1" min="0" inputMode="numeric" aria-invalid={!!errors.quantity} {...register('quantity', { valueAsNumber: true })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner label="Saving" />}{editing ? 'Save changes' : 'Add vehicle'}</Button>
        </div>
      </form>
    </Modal>
  );
}
