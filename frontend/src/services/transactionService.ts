import { api } from './api';
import { Transaction, DashboardData } from '../types';

export interface GetTransactionsParams {
  search?: string;
  category?: string;
  type?: 'all' | 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'desc' | 'asc';
  limit?: number;
}

export const transactionService = {
  getTransactions: (params: GetTransactionsParams = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    return api.get<{ transactions: Transaction[]; count: number }>(`/transactions${qs ? `?${qs}` : ''}`);
  },

  getDashboardSummary: () =>
    api.get<DashboardData>('/transactions/summary'),

  createTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'user'>) =>
    api.post<{ message: string; transaction: Transaction }>('/transactions', data),

  updateTransaction: (id: string, data: Partial<Transaction>) =>
    api.put<{ message: string; transaction: Transaction }>(`/transactions/${id}`, data),

  deleteTransaction: (id: string) =>
    api.delete<{ message: string }>(`/transactions/${id}`),

  exportCsv: () =>
    api.downloadCsv('/transactions/export/csv')
};
