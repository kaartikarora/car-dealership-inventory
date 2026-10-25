import { useState } from 'react';
import type { VehicleFilters } from '../../lib/types';
import { useDebounced } from '../../lib/useDebounced';
import { Button } from '../../components/ui';
import { useAuth } from '../auth/AuthContext';
import { AddVehicleButton } from '../admin/AddVehicleButton';
import { FilterBar } from './FilterBar';
import { hasFilters } from './searchParams';
import { StatsStrip } from './StatsStrip';
import { useVehicles } from './useVehicles';
import { VehicleCard } from './VehicleCard';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [filters, setFilters] = useState<VehicleFilters>({});
  const debounced = useDebounced(filters);
  const invalidRange = debounced.minPrice !== undefined && debounced.maxPrice !== undefined && debounced.minPrice > debounced.maxPrice;

  const all = useVehicles({});
  const results = useVehicles(invalidRange ? {} : debounced);
  const vehicles = results.data ?? [];

  return (
    <>
      <section className="bg-ink pb-10 text-white">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">Hello, {user?.name.split(' ')[0]}</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">The showroom floor</h1>
            </div>
            {isAdmin && <AddVehicleButton />}
          </div>
          <div className="mt-6">{all.data && <StatsStrip vehicles={all.data} />}</div>
        </div>
      </section>

      <div className="mx-auto -mt-6 max-w-7xl space-y-6 px-4 pb-16 sm:px-6">
        <FilterBar filters={filters} onChange={setFilters} />

        {results.isError ? (
          <div className="rounded-2xl border border-danger/20 bg-white p-10 text-center">
            <p className="font-semibold">Could not load the inventory.</p>
            <p className="mt-1 text-sm text-muted">{results.error.message}</p>
            <Button variant="secondary" className="mt-4" onClick={() => results.refetch()}>Try again</Button>
          </div>
        ) : results.isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading vehicles">
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-line/60" />)}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
            <p className="font-display text-lg font-bold">{hasFilters(debounced) ? 'No cars match those filters.' : 'The showroom is empty.'}</p>
            <p className="mt-1 text-sm text-muted">{hasFilters(debounced) ? 'Try a wider price range or another category.' : isAdmin ? 'Add the first vehicle to get started.' : 'Check back soon.'}</p>
            {hasFilters(debounced) && <Button variant="secondary" className="mt-4" onClick={() => setFilters({})}>Clear filters</Button>}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted" aria-live="polite">
              Showing {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'}{results.isFetching && ' · updating…'}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          </>
        )}
      </div>
    </>
  );
}
