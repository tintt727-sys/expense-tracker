import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Plus, BarChart3, Settings } from 'lucide-react';

interface BottomNavProps {
  onOpenTransactionModal?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenTransactionModal }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold transition-colors ${
            isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/transactions"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold transition-colors ${
            isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        <Receipt className="w-5 h-5" />
        <span>Records</span>
      </NavLink>

      {/* Center Floating Plus Button */}
      {onOpenTransactionModal && (
        <button
          onClick={onOpenTransactionModal}
          aria-label="Add transaction"
          className="-mt-5 p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-xl shadow-purple-500/40 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      )}

      <NavLink
        to="/reports"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold transition-colors ${
            isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        <BarChart3 className="w-5 h-5" />
        <span>Reports</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-semibold transition-colors ${
            isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
};
