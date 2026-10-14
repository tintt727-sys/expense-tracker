import React from 'react';
import { Search, Filter, ArrowUpDown, X, Calendar } from 'lucide-react';
import { Category } from '../types';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (val: string) => void;
  dateRange: string;
  onDateRangeChange: (val: string) => void;
  customStartDate: string;
  onCustomStartDateChange: (val: string) => void;
  customEndDate: string;
  onCustomEndDateChange: (val: string) => void;
  sortBy: 'date' | 'amount';
  onSortByChange: (val: 'date' | 'amount') => void;
  sortOrder: 'desc' | 'asc';
  onSortOrderChange: (val: 'desc' | 'asc') => void;
  categories: Category[];
  onReset: () => void;
  isFiltered: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedType,
  onTypeChange,
  dateRange,
  onDateRangeChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  categories,
  onReset,
  isFiltered
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
      <div className="flex flex-col lg:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by description, category, or amount..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          >
            <option value="all">All Types</option>
            <option value="income">🟢 Income</option>
            <option value="expense">🔴 Expense</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date Range Preset */}
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Sorting */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-') as ['date' | 'amount', 'desc' | 'asc'];
              onSortByChange(sb);
              onSortOrderChange(so);
            }}
            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Inputs (visible only if Custom Range is selected) */}
      {dateRange === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-slide-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomStartDateChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomEndDateChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};
