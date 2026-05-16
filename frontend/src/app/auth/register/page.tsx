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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      await registerUser(values as unknown as { email: string; password: string; name: string; orgName: string });
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10 my-8">
      <div className="w-full max-w-md animate-float-delayed">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,245,212,0.3)]">
            <TrendingUp className="w-8 h-8 text-brand-500 animate-pulseGlow" />
          </div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">System Uplink</h1>
          <p className="text-brand-500 font-mono tracking-widest text-sm mt-3 uppercase">Initialize operator credentials</p>
        </div>

        <div className="card p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-expense/10 border border-expense/30 rounded-none p-4 text-sm text-expense font-mono tracking-wider animate-pulse">
                [ERROR] {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-space-muted uppercase tracking-widest">Fleet Designation</label>
              <input type="text" className="input-field" placeholder="Acme Station" {...register('orgName')} />
              {errors.orgName && <p className="text-expense text-xs mt-1 font-mono">{errors.orgName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-space-muted uppercase tracking-widest">Operator Name</label>
              <input type="text" className="input-field" placeholder="Jane Doe" {...register('name')} />
              {errors.name && <p className="text-expense text-xs mt-1 font-mono">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-space-muted uppercase tracking-widest">Operator Email</label>
              <input type="email" className="input-field" placeholder="jane@fintrack.space" {...register('email')} />
              {errors.email && <p className="text-expense text-xs mt-1 font-mono">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-space-muted uppercase tracking-widest">Access Code</label>
              <input type="password" className="input-field" placeholder="Min. 8 chars, 1 uppercase, 1 number" {...register('password')} />
              {errors.password && <p className="text-expense text-xs mt-1 font-mono">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 mt-8">
              {isSubmitting ? 'Establishing Link...' : 'Establish Uplink'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-space-muted mt-8 font-mono tracking-widest uppercase">
          Already verified?{' '}
          <Link href="/auth/login" className="text-brand-500 font-bold hover:drop-shadow-[0_0_8px_rgba(0,245,212,0.8)] transition-all">
            Access Terminal
          </Link>
        </p>
      </div>
    </div>
  );
}
