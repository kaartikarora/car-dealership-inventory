import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/vehicles/DashboardPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 15_000, refetchOnWindowFocus: true, retry: 1 } },
});

// Signed-in users skip the login and register pages.
function GuestOnly({ children }: { children: React.ReactElement }) {
  return useAuth().user ? <Navigate to="/" replace /> : children;
}

function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-display text-6xl font-extrabold">404</p>
      <p className="text-muted">This page drove off the lot.</p>
      <Link to="/" className="font-semibold underline underline-offset-4">Back to the showroom</Link>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
              <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
