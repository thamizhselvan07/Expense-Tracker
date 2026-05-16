'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { TrendChart } from '../../components/charts/TrendChart';
import { useDashboardSummary } from '../../hooks/useApi';
import { Transaction } from '../../types';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function DashboardPage() {
  const year = new Date().getFullYear();
  const { data, isLoading } = useDashboardSummary(year);

  const summary = data?.summary;

  const stats = useMemo(() => [
    {
      label: 'Total Income',
      value: summary ? formatCurrency(summary.totalIncome) : '—',
      icon: TrendingUp,
      variant: 'income' as const,
    },
    {
      label: 'Total Expense',
      value: summary ? formatCurrency(summary.totalExpense) : '—',
      icon: TrendingDown,
      variant: 'expense' as const,
    },
    {
      label: 'Net Balance',
      value: summary ? formatCurrency(summary.netBalance) : '—',
      icon: Wallet,
      variant: (summary?.netBalance ?? 0) >= 0 ? 'income' as const : 'expense' as const,
    },
    {
      label: 'Transactions',
      value: summary ? String(summary.transactionCount) : '—',
      icon: Activity,
      variant: 'neutral' as const,
    },
  ], [summary]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 h-28 animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,245,212,0.3)]">Dashboard</h1>
        <p className="text-space-muted font-mono tracking-widest text-sm mt-2">Mission control overview for {year}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Chart */}
      <TrendChart year={year} />

      {/* Recent transactions */}
      <div className="card">
        <div className="px-6 py-5 border-b border-space-border bg-black/40">
          <h3 className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500 animate-pulseGlow" /> 
            Recent Transactions
          </h3>
        </div>
        <div className="divide-y divide-space-border/50">
          {data?.recentTransactions?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-space-muted">
              <div className="w-16 h-16 mb-4 rounded-full border border-space-border flex items-center justify-center animate-float">
                <Activity className="w-6 h-6 opacity-50" />
              </div>
              <p className="text-sm font-mono uppercase tracking-widest">No signals detected</p>
            </div>
          )}
          {data?.recentTransactions?.map((tx: Transaction) => (
            <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group cursor-default">
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm border shadow-[0_0_15px_rgba(0,0,0,0.5)]',
                  tx.type === 'INCOME' ? 'bg-income/10 text-income border-income/30 group-hover:shadow-[0_0_15px_rgba(57,255,20,0.4)]' : 'bg-expense/10 text-expense border-expense/30 group-hover:shadow-[0_0_15px_rgba(255,56,100,0.4)]'
                )}
              >
                {tx.type === 'INCOME' ? '↑' : '↓'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate font-sans tracking-wide">{tx.description}</p>
                <p className="text-xs text-space-muted font-mono tracking-wider mt-0.5">
                  {tx.category?.name && <span className="text-brand-500/80">{tx.category.name} · </span>}
                  {format(new Date(tx.date), 'MMM d, yyyy')}
                </p>
              </div>
              <span
                className={clsx(
                  'text-base font-mono tracking-wider group-hover:animate-pulseGlow',
                  tx.type === 'INCOME' ? 'text-income drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]' : 'text-expense drop-shadow-[0_0_8px_rgba(255,56,100,0.5)]'
                )}
              >
                {tx.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(parseFloat(tx.amount))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
