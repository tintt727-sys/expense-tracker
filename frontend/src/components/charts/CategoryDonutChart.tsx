import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryChartData } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';

interface CategoryDonutChartProps {
  data: CategoryChartData[];
}

const COLORS = [
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#6366f1', // Indigo
  '#84cc16'  // Lime
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data }) => {
  const { format } = useCurrency();

  const totalExpense = data.reduce((acc, curr) => acc + curr.amount, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs font-medium space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
          <p className="text-purple-600 dark:text-purple-400 font-semibold">{format(item.amount)}</p>
          <p className="text-slate-400">{percentage}% of total expenses</p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0 || totalExpense === 0) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center text-slate-400 text-sm">
        No expense records to display
      </div>
    );
  }

  return (
    <div className="w-full h-72 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="relative w-full sm:w-1/2 h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="amount"
              stroke="transparent"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-white">
            {format(totalExpense)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="w-full sm:w-1/2 flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {data.map((item, index) => {
          const pct = totalExpense > 0 ? ((item.amount / totalExpense) * 100).toFixed(0) : 0;
          return (
            <div key={item.name} className="flex items-center justify-between text-xs py-0.5">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-semibold">{pct}%</span>
                <span className="text-slate-400">({format(item.amount)})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
