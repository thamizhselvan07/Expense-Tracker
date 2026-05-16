export type Role = 'ADMIN' | 'ACCOUNTANT' | 'USER';
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  orgId: string;
  organization: { id: string; name: string; slug: string };
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  orgId: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: string;
  type: TransactionType;
  description: string;
  date: string;
  orgId: string;
  userId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  user: { id: string; name: string };
}

export interface TransactionPage {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface DashboardSummary {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
    savingsRate: number;
  };
  recentTransactions: Transaction[];
}

export interface MonthlyTrend {
  month: number;
  income: number;
  expense: number;
}
