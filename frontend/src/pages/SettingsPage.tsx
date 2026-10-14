import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Coins,
  Shield,
  Download,
  KeyRound,
  User,
  Check,
  Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useCurrency } from '../hooks/useCurrency';
import { authService } from '../services/authService';
import { transactionService } from '../services/transactionService';
import { useToast } from '../components/Toast';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { success, error, info } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const res = await authService.updateProfile({
        name,
        password: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      updateUser(res.user);
      success('Profile details saved successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      error(err.message || 'Profile update failed.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      info('Preparing your CSV data export...');
      await transactionService.exportCsv();
      success('CSV exported successfully!');
    } catch (err: any) {
      error(err.message || 'Export failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize currency, visual theme, and account credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance & Theme */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Appearance Theme</h3>
              <p className="text-xs text-slate-400">Switch between light and dark visual mode</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'border-purple-600 bg-purple-50/50 text-purple-700 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-bold">Light Theme</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'border-purple-500 bg-purple-950/40 text-purple-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-6 h-6 text-purple-400" />
              <span className="text-xs font-bold">Dark Theme</span>
            </button>
          </div>
        </div>

        {/* Currency Preference */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Display Currency</h3>
              <p className="text-xs text-slate-400">Choose primary formatting currency</p>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            {[
              { code: 'MMK', label: 'Myanmar Kyat (MMK)', symbol: 'Ks' },
              { code: 'USD', label: 'United States Dollar (USD)', symbol: '$' },
              { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
              { code: 'THB', label: 'Thai Baht (THB)', symbol: '฿' }
            ].map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  success(`Currency set to ${c.code}`);
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs font-semibold transition-all ${
                  currency === c.code
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{c.label}</span>
                {currency === c.code && <Check className="w-4 h-4 text-purple-600" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Profile and Password Change */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Details & Security</h3>
            <p className="text-xs text-slate-400">Update your name or update your account password</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Email Address (Permanent)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Change Password (Optional)
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-xl shadow-md shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Data Export Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Export Financial Records</h3>
          <p className="text-xs text-slate-400 mt-1">Download your personal database records into a CSV spreadsheet.</p>
        </div>
        <button
          onClick={handleExportData}
          className="px-5 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 font-bold text-xs hover:bg-purple-100 transition-all flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
    </div>
  );
};
