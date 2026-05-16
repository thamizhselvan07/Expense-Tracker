'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../../../lib/auth';

const schema = z.object({
  email: z.string().min(1, 'Operator email is required').email('Invalid email format'),
  password: z.string().min(1, 'Access code is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      await login(values.email, values.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md animate-float">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,245,212,0.3)]">
            <TrendingUp className="w-8 h-8 text-brand-500 animate-pulseGlow" />
          </div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">System Login</h1>
          <p className="text-brand-500 font-mono tracking-widest text-sm mt-3 uppercase">Authenticate to proceed</p>
        </div>

        <div className="card p-8 relative overflow-hidden">
          {/* Decorative lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-expense/10 border border-expense/30 rounded-none p-4 text-sm text-expense font-mono tracking-wider animate-pulse">
                [ERROR] {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-space-muted uppercase tracking-widest">Operator Email</label>
              <input type="email" className="input-field" placeholder="operator@fintrack.space" {...register('email')} />
              {errors.email && <p className="text-expense text-xs mt-1 font-mono">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-space-muted uppercase tracking-widest">Access Code</label>
              <input type="password" className="input-field" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-expense text-xs mt-1 font-mono">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 mt-8">
              {isSubmitting ? 'Authenticating...' : 'Initialize Uplink'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-space-muted mt-8 font-mono tracking-widest uppercase">
          No access codes?{' '}
          <Link href="/auth/register" className="text-brand-500 font-bold hover:drop-shadow-[0_0_8px_rgba(0,245,212,0.8)] transition-all">
            Request Uplink
          </Link>
        </p>
      </div>
    </div>
  );
}
