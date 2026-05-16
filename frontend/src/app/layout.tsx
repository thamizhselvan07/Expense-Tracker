import type { Metadata } from 'next';
import { Orbitron, DM_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-dm-mono' });

export const metadata: Metadata = {
  title: 'FinTrack — Zero Gravity Finances',
  description: 'Mission control dashboard for your finances',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${dmMono.variable}`}>
      <body className="bg-space-bg text-white antialiased font-sans relative overflow-x-hidden">
        {/* Starfield overlay */}
        <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-space-bg to-space-bg"></div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
