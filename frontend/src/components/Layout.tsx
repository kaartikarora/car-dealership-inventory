import { Link, Outlet } from 'react-router';
import { useAuth } from '../features/auth/AuthContext';

export function Layout() {
  const { user, isAdmin, signOut } = useAuth();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/95 text-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight">Showroom<span className="text-brand">.</span></Link>
          {isAdmin && <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-semibold text-brand ring-1 ring-brand/30">Admin</span>}
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-white/70 sm:inline">{user?.email}</span>
            <button onClick={signOut} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white/90 ring-1 ring-white/20 hover:bg-white/10">Sign out</button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
