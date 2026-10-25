import type { Category } from '../../lib/types';

// Side-view silhouettes drawn per category, so every card has artwork without image hosting.
const bodies: Record<Category, string> = {
  SEDAN: 'M12 58l10-16c3-5 8-8 14-9l26-4c6-1 11-5 16-9 5-3 11-5 17-5h28c7 0 13 3 18 8l14 13 22 4c6 1 11 6 11 12v6H12z',
  SUV: 'M12 58V40c0-5 3-9 8-10l18-4 14-12c3-3 7-4 11-4h58c6 0 11 3 14 8l11 16 20 4c6 1 10 6 10 12v8H12z',
  HATCHBACK: 'M16 58l8-15c3-6 9-10 16-11l22-3 16-12c4-3 9-4 14-4h30c6 0 11 4 14 9l12 26 14 3c5 1 8 5 8 10v7H16z',
  TRUCK: 'M10 58V38c0-4 3-7 7-7h62V16c0-3 3-6 6-6h34c5 0 9 2 12 6l14 18 32 6c6 1 10 6 10 12v6H10z',
  EV: 'M12 58l12-15c4-5 10-8 16-9l30-5c8-6 17-13 28-14h22c10 0 19 4 26 11l12 10 18 4c6 1 10 6 10 12v6H12z',
  COUPE: 'M10 58l14-12c5-4 11-6 17-7l34-5c9-7 20-13 32-14h14c11 0 21 6 28 14l8 9 22 5c5 1 9 5 9 10v0H10z',
};

const tint: Record<Category, string> = {
  SEDAN: 'from-sky-100 to-sky-50 text-sky-900/80',
  SUV: 'from-emerald-100 to-emerald-50 text-emerald-900/80',
  HATCHBACK: 'from-violet-100 to-violet-50 text-violet-900/80',
  TRUCK: 'from-orange-100 to-orange-50 text-orange-900/80',
  EV: 'from-teal-100 to-cyan-50 text-teal-900/80',
  COUPE: 'from-rose-100 to-rose-50 text-rose-900/80',
};

export function CarArt({ category, dimmed = false }: { category: Category; dimmed?: boolean }) {
  return (
    <div className={`relative flex h-36 items-end justify-center overflow-hidden bg-gradient-to-br ${tint[category]} ${dimmed ? 'grayscale' : ''}`}>
      <div aria-hidden className="absolute inset-x-6 bottom-5 h-2 rounded-full bg-black/10 blur-sm" />
      <svg aria-hidden viewBox="0 0 200 72" className="relative mb-3 w-4/5">
        <path d={bodies[category]} fill="currentColor" />
        <circle cx="52" cy="58" r="11" fill="#0f172a" />
        <circle cx="52" cy="58" r="4.5" fill="#cbd5e1" />
        <circle cx="152" cy="58" r="11" fill="#0f172a" />
        <circle cx="152" cy="58" r="4.5" fill="#cbd5e1" />
        {category === 'EV' && <path d="M104 22l-8 14h7l-3 11 10-15h-7l3-10z" fill="#fde047" />}
      </svg>
    </div>
  );
}
