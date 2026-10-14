import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MonthlyChartData } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { getMonthName } from '../../utils/formatters';

interface IncomeExpenseBarChartProps {
  data: MonthlyChartData[];
}

export const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({ data }) => {
  const { format } = useCurrency();

  const chartData = data.map((item) => ({
    ...item,
    formattedMonth: getMonthName(item.month)
  }));

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
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <XAxis
            dataKey="formattedMonth"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => {
              if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
              if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
              return val;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
          />
          <Bar
            name="Income"
            dataKey="income"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            name="Expense"
            dataKey="expense"
            fill="#f43f5e"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
