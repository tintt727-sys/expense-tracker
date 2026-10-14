import { api } from './api';
import { Category, TransactionType } from '../types';

export const categoryService = {
  getCategories: (type?: TransactionType | 'all') => {
    const qs = type && type !== 'all' ? `?type=${type}` : '';
    return api.get<{ categories: Category[] }>(`/categories${qs}`);
  },

  createCategory: (data: { name: string; icon: string; type: TransactionType }) =>
    api.post<{ message: string; category: Category }>('/categories', data),

  updateCategory: (id: string, data: { name?: string; icon?: string; type?: TransactionType }) =>
    api.put<{ message: string; category: Category }>(`/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete<{ message: string }>(`/categories/${id}`)
};
