import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Download,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpDown
} from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { Transaction, Category, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useCurrency } from '../hooks/useCurrency';
import { FilterBar } from '../components/FilterBar';
import { TransactionModal } from '../components/TransactionModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { CategoryIcon } from '../components/CategoryIcon';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';

export const TransactionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter State
  const [search, setSearch] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { format } = useCurrency();
  const { success, error, info } = useToast();

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getCategories();
      setCategories(res.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Determine date filters based on preset
      let start = '';
      let end = '';
      const now = new Date();

      if (dateRange === 'today') {
        start = now.toISOString().slice(0, 10);
        end = start;
      } else if (dateRange === 'week') {
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
        start = firstDay.toISOString().slice(0, 10);
        end = new Date().toISOString().slice(0, 10);
      } else if (dateRange === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      } else if (dateRange === 'custom') {
        start = customStartDate;
        end = customEndDate;
      }

      const res = await transactionService.getTransactions({
        search,
        category: selectedCategory,
        type: selectedType as any,
        startDate: start,
        endDate: end,
        sortBy,
        sortOrder
      });

      setTransactions(res.transactions);
    } catch (err: any) {
      error(err.message || 'Error loading transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTransactions();
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [
    search,
    selectedCategory,
    selectedType,
    dateRange,
    customStartDate,
    customEndDate,
    sortBy,
    sortOrder
  ]);

  const handleSave = async (data: any) => {
    try {
      if (editingTransaction) {
        await transactionService.updateTransaction(editingTransaction.id, data);
        success('Transaction updated successfully.');
      } else {
        await transactionService.createTransaction(data);
        success('Transaction created successfully.');
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
      fetchTransactions();
    } catch (err: any) {
      error(err.message || 'Failed to save transaction');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await transactionService.deleteTransaction(deletingId);
      success('Transaction deleted successfully.');
      setDeletingId(null);
      fetchTransactions();
    } catch (err: any) {
      error(err.message || 'Failed to delete transaction');
    }
  };

  const handleExportCsv = async () => {
    try {
      info('Exporting transactions to CSV...');
      await transactionService.exportCsv();
      success('CSV exported successfully!');
    } catch (err: any) {
      error(err.message || 'CSV export failed.');
    }
  };

  const isFiltered =
    Boolean(search) ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    dateRange !== 'all' ||
    Boolean(customStartDate) ||
    Boolean(customEndDate);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedType('all');
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setSearchParams({});
  };

  // Group transactions by date for aesthetic display
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });
    return groups;
  }, [transactions]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transaction Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, edit, and organize all your financial records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-xs shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter and Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customStartDate={customStartDate}
        onCustomStartDateChange={setCustomStartDate}
        customEndDate={customEndDate}
        onCustomEndDateChange={setCustomEndDate}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        categories={categories}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Transaction Records Count */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>Found {transactions.length} transactions</span>
        <span>Sorted by: {sortBy === 'date' ? 'Date' : 'Amount'} ({sortOrder.toUpperCase()})</span>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Searching transactions..." />
        </div>
      ) : transactions.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800 tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description / Note</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-purple-50/30 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4 pl-6 font-semibold text-slate-800 dark:text-slate-200">
                        {formatDate(tx.date)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isIncome
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                            }`}
                          >
                            <CategoryIcon name={tx.category} className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {tx.category}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                        {tx.description || '-'}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 font-black text-sm">
                        <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isIncome ? `+${format(tx.amount)}` : `-${format(tx.amount)}`}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isIncome
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingTransaction(tx);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(tx.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div key={tx.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-2xl ${
                          isIncome
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                        }`}
                      >
                        <CategoryIcon name={tx.category} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {tx.category}
                        </h4>
                        <p className="text-xs text-slate-400">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-black ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? `+${format(tx.amount)}` : `-${format(tx.amount)}`}
                      </span>
                    </div>
                  </div>

                  {tx.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                      {tx.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/40 text-xs">
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {tx.paymentMethod}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTransaction(tx);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-purple-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(tx.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No transactions match your search"
          description="Try adjusting your filters, searching for a different keyword, or add a new transaction."
          actionText={isFiltered ? 'Reset Filters' : 'Add Transaction'}
          onAction={
            isFiltered
              ? handleResetFilters
              : () => {
                  setEditingTransaction(null);
                  setIsModalOpen(true);
                }
          }
        />
      )}

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSave}
        transaction={editingTransaction}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingId}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
