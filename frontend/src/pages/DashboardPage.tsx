import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { DashboardData, Category, Transaction } from '../types';
import { SummaryCard } from '../components/SummaryCard';
import { IncomeExpenseBarChart } from '../components/charts/IncomeExpenseBarChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { StatisticsChart } from '../components/charts/StatisticsChart';
import { CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useCurrency } from '../hooks/useCurrency';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { TransactionModal } from '../components/TransactionModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useToast } from '../components/Toast';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit / Delete transaction state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  const { format, currency } = useCurrency();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const { onOpenTransactionModal } = useOutletContext<{ onOpenTransactionModal: () => void }>() || {};

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, catsRes, txListRes] = await Promise.all([
        transactionService.getDashboardSummary(),
        categoryService.getCategories(),
        transactionService.getTransactions({ limit: 100 })
      ]);

      setData(summaryRes);
      setCategories(catsRes.categories);
      setAllTransactions(txListRes.transactions);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for custom event when new transaction is added from header/sidebar
    const handleUpdate = () => fetchDashboardData();
    window.addEventListener('transactionUpdated', handleUpdate);
    return () => window.removeEventListener('transactionUpdated', handleUpdate);
  }, []);

  const handleUpdateTransaction = async (formData: any) => {
    if (!editingTx) return;
    try {
      await transactionService.updateTransaction(editingTx.id, formData);
      success('Transaction updated!');
      setEditingTx(null);
      fetchDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTxId) return;
    try {
      await transactionService.deleteTransaction(deletingTxId);
      success('Transaction deleted');
      setDeletingTxId(null);
      fetchDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to delete transaction');
    }
  };

  if (loading && !data) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Calculating financial metrics..." />
      </div>
    );
  }

  const summary = data?.summary || {
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    remainingBalance: 0,
    transactionCount: 0
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Greeting & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-purple-600 dark:text-purple-400">{user?.name}</span>. Here is your cashflow overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTransactionModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-sm shadow-md shadow-purple-500/25 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards: Total Balance, Total Income, Total Expense */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Balance"
          amount={summary.totalBalance}
          type="balance"
          subtitle="Net Available"
        />
        <SummaryCard
          title="Total Income"
          amount={summary.totalIncome}
          type="income"
          subtitle="Total Received"
        />
        <SummaryCard
          title="Total Expense"
          amount={summary.totalExpense}
          type="expense"
          subtitle="Total Spent"
        />
      </div>

      {/* Current Balance Summary Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-purple-200">
              Current Balance Summary
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black">{format(summary.remainingBalance)}</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
                {currency}
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-2">
              Based on {summary.transactionCount} tracked transactions in your account.
            </p>
          </div>

          <div className="flex items-center gap-6 divide-x divide-purple-700/60 pt-4 md:pt-0 border-t md:border-t-0 border-purple-700/60">
            <div className="pr-4">
              <span className="text-xs text-purple-200 block">Total Inflow</span>
              <span className="text-base font-bold text-emerald-300">+{format(summary.totalIncome)}</span>
            </div>
            <div className="pl-4 pr-4">
              <span className="text-xs text-purple-200 block">Total Outflow</span>
              <span className="text-base font-bold text-rose-300">-{format(summary.totalExpense)}</span>
            </div>
            <div className="pl-4">
              <span className="text-xs text-purple-200 block">Remaining</span>
              <span className="text-base font-bold text-white">{format(summary.remainingBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid: Income vs Expense & Expense Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Income vs Expense
              </h3>
              <p className="text-xs text-slate-400">Monthly cash inflow and outflow comparison</p>
            </div>
          </div>
          {data?.charts.monthlyChart && data.charts.monthlyChart.length > 0 ? (
            <IncomeExpenseBarChart data={data.charts.monthlyChart} />
          ) : (
            <EmptyState title="No monthly data" description="Record transactions to see monthly charts." />
          )}
        </div>

        {/* Expense Category Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Expense by Category
              </h3>
              <p className="text-xs text-slate-400">Breakdown of expenses by category</p>
            </div>
          </div>
          {data?.charts.categoryChart && data.charts.categoryChart.length > 0 ? (
            <CategoryDonutChart data={data.charts.categoryChart} />
          ) : (
            <EmptyState title="No expenses recorded" description="Add expenses to see category breakdown." />
          )}
        </div>
      </div>

      {/* Statistics Interactive Chart (Weekly, Monthly, Yearly) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Cashflow Trends & Statistics
          </h3>
          <p className="text-xs text-slate-400">Analyze performance over time</p>
        </div>
        <StatisticsChart transactions={allTransactions} />
      </div>

      {/* Recent Transactions List (Latest 5-10 records) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400">Latest 5-10 recorded transactions</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:underline transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data?.recentTransactions && data.recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      <CategoryIcon name={tx.category} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {tx.description || tx.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {tx.category}
                        </span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-sm sm:text-base font-extrabold ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? `+${format(tx.amount)}` : `-${format(tx.amount)}`}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isIncome
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No transactions recorded yet"
              description="Record your first income or expense to generate live analytics."
              actionText="Add Transaction"
              onAction={onOpenTransactionModal}
            />
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <TransactionModal
          isOpen={true}
          onClose={() => setEditingTx(null)}
          onSave={handleUpdateTransaction}
          transaction={editingTx}
          categories={categories}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingTxId}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record?"
        confirmText="Delete"
        isDanger={true}
        onConfirm={handleDeleteTransaction}
        onCancel={() => setDeletingTxId(null)}
      />
    </div>
  );
};
