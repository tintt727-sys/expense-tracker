export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Cash' | 'Bank' | 'Card' | 'Mobile Payment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  createdAt?: string;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  remainingBalance: number;
  transactionCount: number;
}

export interface MonthlyChartData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryChartData {
  name: string;
  amount: number;
  [key: string]: any;
}

export interface DashboardData {
  summary: DashboardSummary;
  charts: {
    monthlyChart: MonthlyChartData[];
    categoryChart: CategoryChartData[];
  };
  recentTransactions: Transaction[];
}

export interface AppSettings {
  currency: string;
  theme: 'light' | 'dark' | 'system';
  appName: string;
  dateFormat: string;
  allowRegistration: boolean;
  [key: string]: any;
}

export interface AdminStats {
  metrics: {
    totalUsers: number;
    totalTransactions: number;
    totalCategories: number;
    systemIncome: number;
    systemExpense: number;
    netFlow: number;
  };
  recentSystemTransactions: Transaction[];
}
