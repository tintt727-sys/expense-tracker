import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard, AlignLeft } from 'lucide-react';
import { Transaction, Category, TransactionType, PaymentMethod } from '../types';
import { useToast } from './Toast';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  transaction?: Transaction | null;
  categories: Category[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transaction,
  categories
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { error } = useToast();

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setDate(transaction.date);
      setPaymentMethod(transaction.paymentMethod);
      setDescription(transaction.description || '');
    } else {
      setType('expense');
      setAmount('');
      const defaultCat = categories.find((c) => c.type === 'expense') || categories[0];
      setCategory(defaultCat ? defaultCat.name : 'Food');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('Cash');
      setDescription('');
    }
  }, [transaction, isOpen, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      error('Please enter a valid positive amount.');
      return;
    }

    if (!category) {
      error('Please choose a category.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        type,
        amount: numAmount,
        category,
        date,
        paymentMethod,
        description: description.trim()
      });
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {transaction ? 'Edit Transaction' : 'New Transaction'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fill in the details to record your financial activity.
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
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const cat = categories.find((c) => c.type === 'expense');
                if (cat) setCategory(cat.name);
              }}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🔴 Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const cat = categories.find((c) => c.type === 'income');
                if (cat) setCategory(cat.name);
              }}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🟢 Income
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-4 pr-16 py-3 text-2xl font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                MMK
              </span>
            </div>
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white"
              >
                {filteredCategories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  filteredCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="Card">Card</option>
                <option value="Mobile Payment">Mobile Payment</option>
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white"
            />
          </div>

          {/* Description / Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Description / Note
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this transaction for? (e.g. Lunch with team)"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-white resize-none"
            />
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
              {submitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
