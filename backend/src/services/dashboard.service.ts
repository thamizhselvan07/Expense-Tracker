import { dashboardRepository } from '../repositories/dashboard.repository';

export const dashboardService = {
  async getSummary(orgId: string, year: number, month?: number) {
    const { totals, byCategory, recentTransactions } =
      await dashboardRepository.getSummary(orgId, year, month);

    const income = totals.find((t) => t.type === 'INCOME');
    const expense = totals.find((t) => t.type === 'EXPENSE');

    const totalIncome = Number(income?._sum.amount ?? 0);
    const totalExpense = Number(expense?._sum.amount ?? 0);
    const netBalance = totalIncome - totalExpense;
    const transactionCount = (income?._count.id ?? 0) + (expense?._count.id ?? 0);

    return {
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        transactionCount,
        savingsRate:
          totalIncome > 0
            ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
            : 0,
      },
      byCategory,
      recentTransactions,
    };
  },

  async getMonthlyTrend(orgId: string, year: number) {
    const raw = await dashboardRepository.getMonthlyTrend(orgId, year);

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    for (const row of raw) {
      const m = months[row.month - 1];
      if (row.type === 'INCOME') m.income = row.total;
      else m.expense = row.total;
    }

    return months;
  },
};
