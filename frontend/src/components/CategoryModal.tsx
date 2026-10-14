import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category, TransactionType } from '../types';
import { useToast } from './Toast';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; type: TransactionType }) => Promise<void>;
  category?: Category | null;
}

const AVAILABLE_ICONS = [
  'Utensils',
  'Car',
  'ShoppingBag',
  'FileText',
  'Briefcase',
  'TrendingUp',
  'Film',
  'MoreHorizontal',
  'Coffee',
  'Home',
  'HeartPulse',
  'GraduationCap',
  'Plane',
  'Gift',
  'Wallet',
  '🍔',
  '🚕',
  '🛍️',
  '💡',
  '💼',
  '📈',
  '🎬',
  '☕',
  '🏠',
  '💊',
  '✈️',
  '🎁'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category
}) => {
  const [name, setName] = useState<string>('');
  const [icon, setIcon] = useState<string>('Utensils');
  const [type, setType] = useState<TransactionType>('expense');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { error } = useToast();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setType(category.type);
    } else {
      setName('');
      setIcon('Utensils');
      setType('expense');
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Category name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        name: name.trim(),
        icon,
        type
      });
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {category ? 'Edit Category' : 'Create Category'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Organize your income and expense records.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-sm font-semibold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expense Category
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-sm font-semibold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Income Category
            </button>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Category Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subscriptions, Gym, Groceries"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Choose Icon / Emoji
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl text-center flex items-center justify-center text-sm font-medium transition-all ${
                    icon === ic
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 ring-2 ring-purple-400'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {ic.length > 2 ? ic.slice(0, 3) : ic}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Selected icon: {icon}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-xl shadow-md shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
