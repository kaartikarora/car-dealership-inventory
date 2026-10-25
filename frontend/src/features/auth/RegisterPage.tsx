import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { ApiError } from '../../lib/api';
import { Button, Field, FormError, Input, Spinner } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { useAuth } from './AuthContext';
import { authApi, type Registration } from './authApi';
import { AuthLayout } from './AuthLayout';

// Mirrors the API's rules so most mistakes are caught before a request is sent.
const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'At least 8 characters').max(72, 'At most 72 characters'),
});

export default function RegisterPage() {
  const { signIn } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string>();
  const { register, handleSubmit, setError, formState } = useForm<Registration>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Registration) {
    setServerError(undefined);
    try {
      const result = await authApi.register(values);
      signIn(result);
      notify('Account created. Welcome to the showroom!', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_TAKEN') setError('email', { message: err.message });
      else setServerError(err instanceof ApiError ? err.message : 'Could not create the account');
    }
  }

  const { errors, isSubmitting } = formState;

  return (
    <AuthLayout title="Create an account" subtitle="Browse the inventory and buy in one click." footer={<>Already have an account? <Link to="/login" className="font-semibold text-ink underline-offset-4 hover:underline">Sign in</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError message={serverError} />
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register('password')} />
        </Field>
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting && <Spinner label="Creating account" />}Create account</Button>
      </form>
    </AuthLayout>
  );
}
