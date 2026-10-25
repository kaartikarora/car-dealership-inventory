import { formatPrice } from '../../lib/format';
import type { Vehicle } from '../../lib/types';

// Summary computed from the live inventory, not hard-coded numbers.
export function StatsStrip({ vehicles }: { vehicles: Vehicle[] }) {
  const inStock = vehicles.reduce((sum, v) => sum + v.quantity, 0);
  const value = vehicles.reduce((sum, v) => sum + v.quantity * v.price, 0);
  const low = vehicles.filter((v) => v.quantity > 0 && v.quantity <= 3).length;
  const soldOut = vehicles.filter((v) => v.quantity === 0).length;

  const stats = [
    { label: 'In the showroom', value: `${vehicles.length} ${vehicles.length === 1 ? 'model' : 'models'}` },
    { label: 'Ready to drive away', value: `${inStock} ${inStock === 1 ? 'car' : 'cars'} in stock` },
    { label: 'Stock value', value: formatPrice(value) },
    { label: 'Running low · Sold out', value: `${low} · ${soldOut}` },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <dt className="text-xs font-medium text-white/60">{s.label}</dt>
          <dd className="mt-1 font-display text-lg font-bold text-white sm:text-xl">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
