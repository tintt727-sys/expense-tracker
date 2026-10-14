import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Tags,
  BarChart3,
  ShieldCheck,
  Settings,
  Wallet,
  X,
  Plus
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTransactionModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenTransactionModal }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Categories', path: '/categories', icon: Tags },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Admin Mode', path: '/admin/dashboard', icon: ShieldCheck },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between p-6 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center justify-between pb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <Wallet className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
                  Expense Tracker
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-0.5">
                  PRO EDITION
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          {onOpenTransactionModal && (
            <button
              onClick={() => {
                onOpenTransactionModal();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 mb-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold text-sm shadow-md shadow-purple-500/25 transition-all duration-200 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Transaction</span>
            </button>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shadow-sm border border-purple-100/80 dark:border-purple-800/40'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Banner */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/20 border border-purple-100/60 dark:border-purple-900/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Connected & Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time sync enabled with MMK currency format.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
