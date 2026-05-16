'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowUpDown,
  Tags,
  LogOut,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowUpDown },
  { href: '/dashboard/categories', label: 'Categories', icon: Tags },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex flex-col bg-space-bg border-r border-space-border backdrop-blur-xl"
      style={{ width: 'var(--sidebar-width)', background: 'linear-gradient(180deg, rgba(5,8,18,1) 0%, rgba(5,8,18,0.8) 100%)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-space-border">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,212,0.2)]">
          <TrendingUp className="w-5 h-5 text-brand-500" />
        </div>
        <span className="font-bold text-white uppercase tracking-[0.2em] text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">FinTrack</span>
      </div>

      {/* Org name */}
      <div className="px-6 py-4 border-b border-space-border/50 bg-black/20">
        <div className="flex items-center gap-3 text-sm text-space-muted">
          <Building2 className="w-4 h-4 text-brand-500" />
          <span className="truncate font-mono tracking-widest text-white">
            {user?.organization?.name}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx('sidebar-link', { active: pathname === href })}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-space-border bg-black/40">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 rounded-full border border-space-border bg-space-surface flex items-center justify-center text-white text-sm font-bold shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate uppercase tracking-widest">{user?.name}</p>
            <p className="text-xs text-brand-500 font-mono tracking-wider uppercase mt-1">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-link w-full !text-expense hover:!bg-expense/10 !border-transparent hover:!shadow-[inset_4px_0_10px_rgba(255,56,100,0.1)] hover:!border-expense"
        >
          <LogOut className="w-5 h-5" />
          Abort Session
        </button>
      </div>
    </aside>
  );
}
