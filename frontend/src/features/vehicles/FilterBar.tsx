import { CATEGORIES, type Category, type VehicleFilters, type VehicleSort } from '../../lib/types';
import { Input, Select } from '../../components/ui';

const chipLabel: Record<Category, string> = { SEDAN: 'Sedan', SUV: 'SUV', HATCHBACK: 'Hatchback', TRUCK: 'Truck', EV: 'EV', COUPE: 'Coupe' };

const toNumber = (value: string) => (value === '' ? undefined : Math.max(0, Number(value)));

interface Props {
  filters: VehicleFilters;
  onChange(filters: VehicleFilters): void;
}

export function FilterBar({ filters, onChange }: Props) {
  const set = (patch: Partial<VehicleFilters>) => onChange({ ...filters, ...patch });
  const priceError = filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice;

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${active ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-line hover:ring-ink/30'}`;

  return (
    <section aria-label="Search and filter" className="space-y-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"><path fill="currentColor" d="M8.5 3a5.5 5.5 0 0 1 4.38 8.83l3.65 3.64-1.06 1.06-3.64-3.65A5.5 5.5 0 1 1 8.5 3zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /></svg>
          <Input type="search" aria-label="Search make or model" placeholder="Search make or model…" className="pl-9" value={filters.q ?? ''} onChange={(e) => set({ q: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2 md:w-64">
          <Input type="number" inputMode="numeric" min={0} aria-label="Minimum price" placeholder="Min $" value={filters.minPrice ?? ''} aria-invalid={priceError} onChange={(e) => set({ minPrice: toNumber(e.target.value) })} />
          <Input type="number" inputMode="numeric" min={0} aria-label="Maximum price" placeholder="Max $" value={filters.maxPrice ?? ''} aria-invalid={priceError} onChange={(e) => set({ maxPrice: toNumber(e.target.value) })} />
        </div>
        <Select aria-label="Sort by" value={filters.sort ?? 'newest'} onChange={(e) => set({ sort: e.target.value as VehicleSort })} className="md:w-44">
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </Select>
        <label className="flex items-center gap-2 rounded-lg px-1 text-sm font-medium text-ink-soft select-none">
          <input type="checkbox" className="size-4 accent-ink" checked={!!filters.inStock} onChange={(e) => set({ inStock: e.target.checked })} />
          In stock only
        </label>
      </div>
      {priceError && <p className="text-xs text-danger">Minimum price is higher than maximum price.</p>}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Category">
        <button type="button" className={chip(!filters.category)} aria-pressed={!filters.category} onClick={() => set({ category: undefined })}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className={chip(filters.category === c)} aria-pressed={filters.category === c} onClick={() => set({ category: filters.category === c ? undefined : c })}>
            {chipLabel[c]}
          </button>
        ))}
      </div>
    </section>
  );
}
