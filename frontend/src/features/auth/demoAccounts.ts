// Demo accounts for reviewers, configured at build time. These are public by design
// (VITE_ variables ship in the bundle), so they must only ever point at demo users.
const env = import.meta.env;

export const demoAccounts = [
  { label: 'Demo customer', email: env.VITE_DEMO_CUSTOMER_EMAIL, password: env.VITE_DEMO_CUSTOMER_PASSWORD },
  { label: 'Demo admin', email: env.VITE_DEMO_ADMIN_EMAIL, password: env.VITE_DEMO_ADMIN_PASSWORD },
].filter((a): a is { label: string; email: string; password: string } => Boolean(a.email && a.password));
