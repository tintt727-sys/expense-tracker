import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Wallet, ShieldCheck, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Navbar */}
      <div className="p-6 flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
              Expense Tracker
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-1">
              PRO
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs text-slate-400">
        <p>© 2026 Expense Tracker Pro. Secure Bank-Grade Encryption & Privacy Protected.</p>
      </div>
    </div>
  );
};
