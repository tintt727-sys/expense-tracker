import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { DashboardData, Transaction } from '../types';
import { IncomeExpenseBarChart } from '../components/charts/IncomeExpenseBarChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { StatisticsChart } from '../components/charts/StatisticsChart';
import { formatCurrency } from '../utils/formatters';
import { useCurrency } from '../hooks/useCurrency';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const { format, currency } = useCurrency();
  const { success, error, info } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [summaryRes, txRes] = await Promise.all([
        transactionService.getDashboardSummary(),
        transactionService.getTransactions({ limit: 500 })
      ]);
      setData(summaryRes);
      setAllTransactions(txRes.transactions);
    } catch (err: any) {
      error(err.message || 'Error generating reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCsv = async () => {
    try {
      info('Preparing CSV export...');
      await transactionService.exportCsv();
      success('Financial summary exported.');
    } catch (err: any) {
      error(err.message || 'Export failed.');
    }
  };

  if (loading && !data) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Generating analytical reports..." />
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

  const savingsRate =
    summary.totalIncome > 0
      ? (((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & Reports
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep dive into spending patterns, cashflow balance, and savings rates.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-xs shadow-sm transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Export All Data (CSV)</span>
        </button>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Income</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            +{format(summary.totalIncome)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">All verified inflows</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Expenses</span>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            -{format(summary.totalExpense)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">All verified outflows</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Savings Rate</span>
          <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {savingsRate}%
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">Net savings percentage</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Records</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {summary.transactionCount}
          </p>
          <span className="text-[11px] text-slate-400 block mt-1">Total recorded events</span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Monthly Inflow vs Outflow
          </h3>
          <p className="text-xs text-slate-400 mb-4">Historical comparison of receipts vs expenditures</p>
          {data?.charts.monthlyChart && <IncomeExpenseBarChart data={data.charts.monthlyChart} />}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Expenditure Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4">Proportion of money allocated per category</p>
          {data?.charts.categoryChart && <CategoryDonutChart data={data.charts.categoryChart} />}
        </div>
      </div>

      {/* Cashflow Trends over Time */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Cashflow Velocity & Frequency
        </h3>
        <p className="text-xs text-slate-400 mb-4">Interactive weekly, monthly, and annual trajectory</p>
        <StatisticsChart transactions={allTransactions} />
      </div>
    </div>
  );
};
