import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router';
import { ApiError } from '../../lib/api';
import { Button, Field, FormError, Input, Spinner } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { useAuth } from './AuthContext';
import { authApi, type Credentials } from './authApi';
import { AuthLayout } from './AuthLayout';
import { demoAccounts } from './demoAccounts';

const schema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export default function LoginPage() {
  const { signIn } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [serverError, setServerError] = useState<string>();
  const { register, handleSubmit, formState } = useForm<Credentials>({ resolver: zodResolver(schema) });

  async function login(credentials: Credentials) {
    setServerError(undefined);
    try {
      const result = await authApi.login(credentials);
      signIn(result);
      notify(`Welcome back, ${result.user.name.split(' ')[0]}`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Could not sign in');
    }
  }

  const busy = formState.isSubmitting;

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to the showroom." footer={<>New here? <Link to="/register" className="font-semibold text-ink underline-offset-4 hover:underline">Create an account</Link></>}>
      <form onSubmit={handleSubmit(login)} className="space-y-4" noValidate>
        <FormError message={serverError} />
        <Field label="Email" htmlFor="email" error={formState.errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!formState.errors.email} {...register('email')} />
        </Field>
        <Field label="Password" htmlFor="password" error={formState.errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!formState.errors.password} {...register('password')} />
        </Field>
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Spinner label="Signing in" />}Sign in</Button>
      </form>

      {demoAccounts.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-center text-xs font-medium tracking-wide text-muted uppercase">or try a demo account</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <Button key={account.label} variant="secondary" disabled={busy} onClick={() => login({ email: account.email, password: account.password })}>
                {account.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
