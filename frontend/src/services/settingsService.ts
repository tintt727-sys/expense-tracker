import { api } from './api';
import { AppSettings } from '../types';

export const settingsService = {
  getSettings: () =>
    api.get<{ settings: AppSettings }>('/settings'),

  updateSetting: (key: string, value: any) =>
    api.put<{ message: string; setting: any }>('/settings/single', { key, value }),

  bulkUpdateSettings: (settings: Partial<AppSettings>) =>
    api.put<{ message: string }>('/settings/bulk', { settings })
};
