import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'balance' | 'income' | 'expense';
  subtitle?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type, subtitle }) => {
  const { format } = useCurrency();

  const config = {
    balance: {
      icon: Wallet,
      iconBg: 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-purple-500/30',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300',
      amountColor: 'text-slate-900 dark:text-white',
      trendIcon: TrendingUp,
      trendText: 'Net Balance'
    },
    income: {
      icon: ArrowUpRight,
      iconBg: 'bg-emerald-500 text-white shadow-emerald-500/20',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
      amountColor: 'text-emerald-600 dark:text-emerald-400',
      trendIcon: TrendingUp,
      trendText: 'Cash Inflow'
    },
    expense: {
      icon: ArrowDownRight,
      iconBg: 'bg-rose-500 text-white shadow-rose-500/20',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
      amountColor: 'text-rose-600 dark:text-rose-400',
      trendIcon: TrendingDown,
      trendText: 'Cash Outflow'
    }
  }[type];

  const Icon = config.icon;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Background soft glow accent */}
      <div
        className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none ${
          type === 'balance'
            ? 'bg-purple-500'
            : type === 'income'
            ? 'bg-emerald-500'
            : 'bg-rose-500'
        }`}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        <div className={`p-3 rounded-2xl shadow-md ${config.iconBg}`}>
          <Icon className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${config.amountColor}`}>
          {type === 'income' ? `+${format(amount)}` : type === 'expense' ? `-${format(amount)}` : format(amount)}
        </h3>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeBg}`}>
          {subtitle || config.trendText}
        </span>
      </div>
    </div>
  );
};
