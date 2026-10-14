import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useCurrency } from '../../hooks/useCurrency';

interface StatisticsChartProps {
  transactions: any[];
}

export const StatisticsChart: React.FC<StatisticsChartProps> = ({ transactions }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const { format } = useCurrency();

  // Aggregate based on selected period
  const getData = () => {
    if (period === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const map: Record<string, { name: string; income: number; expense: number }> = {};
      days.forEach((d) => (map[d] = { name: d, income: 0, expense: 0 }));

      transactions.forEach((tx) => {
        const d = new Date(tx.date);
        const dayName = days[d.getDay()];
        if (map[dayName]) {
          if (tx.type === 'income') map[dayName].income += Number(tx.amount);
          else map[dayName].expense += Number(tx.amount);
        }
      });
      return Object.values(map);
    }

    if (period === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const map: Record<string, { name: string; income: number; expense: number }> = {};
      months.forEach((m) => (map[m] = { name: m, income: 0, expense: 0 }));

      transactions.forEach((tx) => {
        const d = new Date(tx.date);
        const monthName = months[d.getMonth()];
        if (map[monthName]) {
          if (tx.type === 'income') map[monthName].income += Number(tx.amount);
          else map[monthName].expense += Number(tx.amount);
        }
      });
      return Object.values(map);
    }

    // Yearly
    const map: Record<string, { name: string; income: number; expense: number }> = {};
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 2; y <= currentYear; y++) {
      map[String(y)] = { name: String(y), income: 0, expense: 0 };
    }

    transactions.forEach((tx) => {
      const year = tx.date.slice(0, 4);
      if (!map[year]) {
        map[year] = { name: year, income: 0, expense: 0 };
      }
      if (tx.type === 'income') map[year].income += Number(tx.amount);
      else map[year].expense += Number(tx.amount);
    });

    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  };

  const chartData = getData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs font-medium space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{label}</p>
          <p className="text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-4">
            <span>Income:</span>
            <span className="font-semibold">{format(payload[0]?.value || 0)}</span>
          </p>
          <p className="text-rose-600 dark:text-rose-400 flex items-center justify-between gap-4">
            <span>Expense:</span>
            <span className="font-semibold">{format(payload[1]?.value || 0)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Period Selector Tabs */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Cashflow Trend
        </span>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                period === p
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#incomeArea)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="#ec4899"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#expenseArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
