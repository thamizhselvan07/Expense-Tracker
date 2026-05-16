import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: 'default' | 'income' | 'expense' | 'neutral';
}

const variantStyles = {
  default: 'text-brand-500 shadow-[0_0_15px_rgba(0,245,212,0.3)] border-brand-500',
  income: 'text-income shadow-[0_0_15px_rgba(57,255,20,0.3)] border-income',
  expense: 'text-expense shadow-[0_0_15px_rgba(255,56,100,0.3)] border-expense',
  neutral: 'text-space-muted shadow-[0_0_15px_rgba(136,146,164,0.3)] border-space-muted',
};

export function StatCard({ label, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className="card p-6 relative overflow-hidden animate-float">
      {/* Background glow orb */}
      <div className={clsx('absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl', variantStyles[variant].split(' ')[0].replace('text-', 'bg-'))} />
      
      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex items-start justify-between">
          <p className="text-xs text-space-muted font-bold uppercase tracking-widest">{label}</p>
          <div className={clsx('p-2.5 rounded-full border bg-black/40', variantStyles[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        <div>
          <p className={clsx('text-3xl font-mono tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]', 
            variant === 'income' ? 'text-income' : variant === 'expense' ? 'text-expense' : 'text-white'
          )}>{value}</p>
          {trend && (
            <p className={clsx('text-xs mt-2 font-mono tracking-wider', trend.value >= 0 ? 'text-income' : 'text-expense')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
