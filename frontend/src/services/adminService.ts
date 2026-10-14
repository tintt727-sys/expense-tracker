import { api } from './api';
import { AdminStats, Transaction, Category } from '../types';

export const adminService = {
  login: (credentials: { username: string; password: string }) =>
    api.post<{ message: string; token: string; admin: { id: string; username: string } }>(
      '/admin/login',
      credentials
    ),

  getStats: () =>
    api.get<AdminStats>('/admin/dashboard-stats', true),

  getAllTransactions: (params: { search?: string; type?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.type) query.append('type', params.type);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return api.get<{ transactions: Transaction[]; total: number; page: number }>(
      `/admin/transactions${qs ? `?${qs}` : ''}`,
      true
    );
  },

  updateTransaction: (id: string, data: Partial<Transaction>) =>
    api.put<{ message: string; transaction: Transaction }>(`/admin/transactions/${id}`, data, true),

  deleteTransaction: (id: string) =>
    api.delete<{ message: string }>(`/admin/transactions/${id}`, true),

  createCategory: (data: { name: string; icon: string; type: string }) =>
    api.post<{ message: string; category: Category }>('/admin/categories', data, true),

  updateCategory: (id: string, data: Partial<Category>) =>
    api.put<{ message: string; category: Category }>(`/admin/categories/${id}`, data, true),

  deleteCategory: (id: string) =>
    api.delete<{ message: string }>(`/admin/categories/${id}`, true),

  downloadBackup: () =>
    api.downloadBackup(),

  resetDatabase: (confirmation: string, preserveUsers = true) =>
    api.post<{ message: string; resetAt: string }>(
      '/admin/database/reset',
      { confirmation, preserveUsers },
      true
    ),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>('/admin/password', data, true)
};
