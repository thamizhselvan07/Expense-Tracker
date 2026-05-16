import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const dashboardRepository = {
  async getSummary(orgId: string, year: number, month?: number) {
    const startDate = month
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1);
    const endDate = month
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(year, 11, 31, 23, 59, 59);

    const where: Prisma.TransactionWhereInput = {
      orgId,
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    };

    const [totals, byCategory, recentTransactions] = await prisma.$transaction([
      prisma.transaction.groupBy({
        by: ['type'],
        where,
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.transaction.groupBy({
        by: ['type', 'categoryId'],
        where,
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      prisma.transaction.findMany({
        where: { orgId, deletedAt: null },
        include: { category: { select: { name: true, color: true } } },
        orderBy: { date: 'desc' },
        take: 10,
      }),
    ]);

    return { totals, byCategory, recentTransactions };
  },

  async getMonthlyTrend(orgId: string, year: number) {
    const result = await prisma.$queryRaw<
      { month: number; type: string; total: number }[]
    >`
      SELECT
        EXTRACT(MONTH FROM date)::int AS month,
        type,
        SUM(amount)::float AS total
      FROM "Transaction"
      WHERE
        "orgId" = ${orgId}
        AND "deletedAt" IS NULL
        AND EXTRACT(YEAR FROM date) = ${year}
      GROUP BY month, type
      ORDER BY month ASC
    `;
    return result;
  },
};
