'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/ui/Sidebar';
import { useAuth } from '../../lib/auth';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-space-bg">
        <div className="w-12 h-12 border-[3px] border-space-border border-t-brand-500 rounded-full animate-spin shadow-[0_0_15px_rgba(0,245,212,0.5)]" />
        <p className="mt-4 text-brand-500 font-mono tracking-widest uppercase text-sm animate-pulse">Establishing uplink...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <DashboardContent>{children}</DashboardContent>
    </ErrorBoundary>
  );
}
