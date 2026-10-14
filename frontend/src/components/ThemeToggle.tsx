import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Theme"
      className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-200 shadow-sm active:scale-95 ${className}`}
    >
      {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
    </button>
  );
};
