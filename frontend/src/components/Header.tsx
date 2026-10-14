import React, { useState } from 'react';
import {
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  Settings,
  Shield,
  Menu,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onGlobalSearch?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onGlobalSearch }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const notifications = [
    {
      id: '1',
      title: 'Monthly Summary Ready',
      desc: 'Your monthly spending report is ready to review.',
      time: '10m ago',
      unread: true
    },
    {
      id: '2',
      title: 'Salary Deposit Recorded',
      desc: 'Deposit of 2,500,000 MMK recorded.',
      time: '2h ago',
      unread: false
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchTerm.trim())}`);
      if (onGlobalSearch) onGlobalSearch(searchTerm.trim());
    }
  };

  return (
    <header className="sticky top-0 z-30 h-20 px-4 sm:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          type="button"
          aria-label="Toggle Sidebar Menu"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records, categories, amounts..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
        </form>
      </div>

      {/* Right: Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            aria-label="Notifications"
            className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm active:scale-95"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-pink-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-50 animate-slide-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Notifications
                </span>
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50 mt-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-500/25">
              {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                {user?.name || 'Guest User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate max-w-[120px]">{user?.email || 'user@app.pro'}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-slide-in">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/admin/dashboard');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 rounded-xl transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Console
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
