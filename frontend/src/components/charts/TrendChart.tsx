'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useMonthlyTrend } from '../../hooks/useApi';
import { MonthlyTrend } from '../../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export function TrendChart({ year }: { year: number }) {
  const { data, isLoading } = useMonthlyTrend(year);

  const chartData = useMemo(() =>
    (data as MonthlyTrend[] | undefined)?.map((d) => ({
      name: MONTHS[d.month - 1],
      Income: d.income,
      Expense: d.expense,
    })) ?? [],
    [data]
  );

  if (isLoading) {
    return (
      <div className="card p-5">
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Loading chart...
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-bold text-white uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulseGlow" />
        Telemetry: {year}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#39ff14" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#39ff14" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3864" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff3864" stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8892a4', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#8892a4', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)} 
            contentStyle={{ backgroundColor: 'rgba(5, 8, 18, 0.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '8px', fontFamily: 'monospace' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px', paddingTop: '10px' }} />
          <Area type="monotone" dataKey="Income" stroke="#39ff14" strokeWidth={3} fill="url(#incomeGrad)" filter="url(#glow)" />
          <Area type="monotone" dataKey="Expense" stroke="#ff3864" strokeWidth={3} fill="url(#expenseGrad)" filter="url(#glow)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
