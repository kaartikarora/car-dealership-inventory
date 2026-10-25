import { categoryLabel, formatPrice } from '../../lib/format';
import type { Vehicle } from '../../lib/types';
import { useAuth } from '../auth/AuthContext';
import { AdminActions } from '../admin/AdminActions';
import { PurchaseButton } from '../inventory/PurchaseButton';
import { CarArt } from './CarArt';
import { StockBadge } from './StockBadge';

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { isAdmin } = useAuth();
  const soldOut = vehicle.quantity <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <CarArt category={vehicle.category} dimmed={soldOut} />
        <div className="absolute top-3 left-3"><StockBadge quantity={vehicle.quantity} /></div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">{categoryLabel(vehicle.category)}</p>
          <h3 className="mt-1 font-display text-lg leading-tight font-bold">{vehicle.make} {vehicle.model}</h3>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <p className="font-display text-2xl font-extrabold tracking-tight">{formatPrice(vehicle.price)}</p>
        </div>
        <PurchaseButton vehicle={vehicle} />
      </div>
      {isAdmin && <AdminActions vehicle={vehicle} />}
    </article>
  );
}
