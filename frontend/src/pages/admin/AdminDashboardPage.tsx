import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Receipt,
  Tags,
  Database,
  Sliders,
  KeyRound,
  Download,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  LogOut,
  TrendingUp,
  TrendingDown,
  Check
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { settingsService } from '../../services/settingsService';
import { categoryService } from '../../services/categoryService';
import { Transaction, Category, AdminStats, AppSettings } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../components/Toast';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { CategoryModal } from '../../components/CategoryModal';
import { TransactionModal } from '../../components/TransactionModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'categories' | 'database' | 'settings' | 'security'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'MMK',
    theme: 'light',
    appName: 'Expense Tracker Pro',
    dateFormat: 'YYYY-MM-DD',
    allowRegistration: true
  });
  const [loading, setLoading] = useState(true);

  // Admin modals state
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null | true>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, txRes, catRes, settingsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAllTransactions({ limit: 100 }),
        categoryService.getCategories(),
        settingsService.getSettings()
      ]);

      setStats(statsRes);
      setTransactions(txRes.transactions);
      setCategories(catRes.categories);
      setSettings(settingsRes.settings);
    } catch (err: any) {
      error(err.message || 'Error loading administrator dashboard');
      if (err.message?.includes('denied') || err.message?.includes('token')) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    info('Logged out from admin mode.');
    navigate('/admin/login');
  };

  const handleUpdateTx = async (data: any) => {
    if (!editTx) return;
    try {
      await adminService.updateTransaction(editTx.id, data);
      success('Transaction updated by admin.');
      setEditTx(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTx = async () => {
    if (!deleteTxId) return;
    try {
      await adminService.deleteTransaction(deleteTxId);
      success('Transaction removed from database.');
      setDeleteTxId(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete transaction');
    }
  };

  const handleSaveCategory = async (data: any) => {
    try {
      if (editCategory && editCategory !== true) {
        await adminService.updateCategory(editCategory.id, data);
        success('Category updated.');
      } else {
        await adminService.createCategory(data);
        success('Category created.');
      }
      setEditCategory(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;
    try {
      await adminService.deleteCategory(deleteCatId);
      success('Category removed.');
      setDeleteCatId(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete category');
    }
  };

  const handleDownloadBackup = async () => {
    try {
      await adminService.downloadBackup();
      success('Backup JSON downloaded successfully.');
    } catch (err: any) {
      error(err.message || 'Backup export failed.');
    }
  };

  const handleResetDatabase = async () => {
    if (resetConfirmInput !== 'CONFIRM_RESET') {
      error('Please type CONFIRM_RESET exactly to proceed.');
      return;
    }
    try {
      await adminService.resetDatabase('CONFIRM_RESET', true);
      success('Database reset completed.');
      setResetModalOpen(false);
      setResetConfirmInput('');
      loadData();
    } catch (err: any) {
      error(err.message || 'Database reset failed');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      error('New passwords do not match.');
      return;
    }
    try {
      await adminService.changePassword({ currentPassword, newPassword });
      success('Admin password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to update admin password');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await settingsService.bulkUpdateSettings(settings);
      success('Application settings updated.');
    } catch (err: any) {
      error(err.message || 'Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner message="Loading Admin Console..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">System Administration</span>
            <span className="text-xs text-purple-400 ml-2 px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800">
              Admin Mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Go to User Dashboard
          </button>
          <button
            onClick={handleAdminLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-900/50 hover:bg-rose-900 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Tabs navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6">
        <nav className="flex space-x-2 overflow-x-auto py-2">
          {[
            { id: 'overview', label: 'Overview', icon: Sliders },
            { id: 'transactions', label: 'Transactions', icon: Receipt },
            { id: 'categories', label: 'Categories', icon: Tags },
            { id: 'database', label: 'Database Control', icon: Database },
            { id: 'settings', label: 'App Settings', icon: Sliders },
            { id: 'security', label: 'Admin Security', icon: KeyRound }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Users</span>
                <p className="text-2xl font-black text-white mt-1">{stats.metrics.totalUsers}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Transactions</span>
                <p className="text-2xl font-black text-white mt-1">{stats.metrics.totalTransactions}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">System Total Income</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  +{formatCurrency(stats.metrics.systemIncome, settings.currency)}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">System Total Expense</span>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  -{formatCurrency(stats.metrics.systemExpense, settings.currency)}
                </p>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Recent System Records</h3>
                <span className="text-xs text-slate-400">{stats.recentSystemTransactions.length} latest records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {stats.recentSystemTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-medium text-white">{tx.user?.name || 'User'}</td>
                        <td className="p-4">{formatDate(tx.date)}</td>
                        <td className="p-4">{tx.category}</td>
                        <td className="p-4 truncate max-w-xs">{tx.description}</td>
                        <td className="p-4 font-bold text-white">
                          {formatCurrency(tx.amount, settings.currency)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              tx.type === 'income'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">All Database Transactions</h3>
                <p className="text-xs text-slate-400">Total {transactions.length} records available.</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Type</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="font-semibold text-white">{tx.user?.name || 'Alex Johnson'}</div>
                          <div className="text-[10px] text-slate-400">{tx.user?.email || 'demo@expensetracker.pro'}</div>
                        </td>
                        <td className="p-4">{formatDate(tx.date)}</td>
                        <td className="p-4 font-medium">{tx.category}</td>
                        <td className="p-4 truncate max-w-[200px]">{tx.description || '-'}</td>
                        <td className="p-4">{tx.paymentMethod}</td>
                        <td className="p-4 font-bold text-white">
                          {formatCurrency(tx.amount, settings.currency)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              tx.type === 'income'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setEditTx(tx)}
                            className="p-1.5 text-slate-400 hover:text-purple-400 rounded-lg hover:bg-slate-800"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTxId(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">System Categories</h3>
                <p className="text-xs text-slate-400">Configure global transaction categories.</p>
              </div>
              <button
                onClick={() => setEditCategory(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                      <span className="text-[11px] text-slate-400 capitalize">{cat.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-purple-400 rounded-lg hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteCatId(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DATABASE CONTROL TAB */}
        {activeTab === 'database' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Database Backup</h3>
                  <p className="text-xs text-slate-400">Download snapshot of all tables.</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Export all user accounts, transactions, category definitions, and settings to an offline JSON backup file.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
              >
                <Download className="w-4 h-4" /> Download Backup (JSON)
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-rose-900/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-rose-950 text-rose-400 border border-rose-800">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-300">Reset Data</h3>
                  <p className="text-xs text-slate-400">Wipe all records and start clean.</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Warning: Resetting will permanently purge all recorded transactions from the database. Default categories and demo user will be preserved.
              </p>
              <button
                onClick={() => setResetModalOpen(true)}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
              >
                <Trash2 className="w-4 h-4" /> Reset Database Records
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white">Global Application Settings</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Application Title
              </label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Default Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="MMK">MMK (Myanmar Kyat)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="THB">THB (฿)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Default Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="system">System Preference</option>
              </select>
            </div>

            <button
              onClick={handleSaveSettings}
              className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/30"
            >
              <Check className="w-4 h-4" /> Save App Settings
            </button>
          </div>
        )}

        {/* SECURITY TAB (Change Admin Password) */}
        {activeTab === 'security' && (
          <div className="max-w-xl bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white">Change Admin Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/30"
              >
                <KeyRound className="w-4 h-4" /> Update Admin Password
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Edit Transaction Modal */}
      {editTx && (
        <TransactionModal
          isOpen={true}
          onClose={() => setEditTx(null)}
          onSave={handleUpdateTx}
          transaction={editTx}
          categories={categories}
        />
      )}

      {/* Category Modal */}
      {editCategory && (
        <CategoryModal
          isOpen={true}
          onClose={() => setEditCategory(null)}
          onSave={handleSaveCategory}
          category={editCategory === true ? null : editCategory}
        />
      )}

      {/* Delete Transaction Confirm */}
      <ConfirmationModal
        isOpen={!!deleteTxId}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction from the system?"
        confirmText="Delete"
        isDanger={true}
        onConfirm={handleDeleteTx}
        onCancel={() => setDeleteTxId(null)}
      />

      {/* Delete Category Confirm */}
      <ConfirmationModal
        isOpen={!!deleteCatId}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        confirmText="Delete"
        isDanger={true}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCatId(null)}
      />

      {/* Reset Database Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-rose-900/60 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-rose-400">Confirm Database Reset</h3>
            <p className="text-xs text-slate-300">
              Type <code className="text-white font-bold bg-slate-800 px-1 py-0.5 rounded">CONFIRM_RESET</code> below to wipe all transactions:
            </p>
            <input
              type="text"
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              placeholder="CONFIRM_RESET"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDatabase}
                disabled={resetConfirmInput !== 'CONFIRM_RESET'}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl disabled:opacity-50"
              >
                Wipe Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
