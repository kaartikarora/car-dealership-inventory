import type { ReactNode } from 'react';
import { Link } from 'react-router';

// Split screen: brand panel on the left (hidden on phones), form on the right.
export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight">Showroom<span className="text-brand">.</span></Link>
        <div className="relative z-10 max-w-md">
          <p className="font-display text-4xl leading-tight font-extrabold">Every car on the floor, live.</p>
          <p className="mt-4 text-white/70">Search the inventory, check real stock, and buy in one click. Stock updates atomically, so the last car is never sold twice.</p>
        </div>
        <p className="text-xs text-white/40">Incubyte TDD kata · Car Dealership Inventory</p>
        <svg aria-hidden className="absolute -right-24 bottom-24 w-[34rem] text-white/5" viewBox="0 0 200 80" fill="currentColor">
          <path d="M10 60l12-26c3-6 9-10 16-10h80c7 0 13 3 17 9l15 21 30 4c6 1 10 6 10 12v6h-20a14 14 0 0 0-28 0H62a14 14 0 0 0-28 0H10z" />
        </svg>
      </aside>
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-10 block font-display text-xl font-extrabold tracking-tight lg:hidden">Showroom<span className="text-brand">.</span></Link>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-muted">{footer}</p>
        </div>
      </main>
    </div>
  );
}
