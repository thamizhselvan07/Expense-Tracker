import { prisma } from '../utils/prisma';
import { TransactionType, Prisma } from '@prisma/client';

export interface TransactionFilters {
  orgId: string;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export const transactionRepository = {
  async create(data: {
    amount: number;
    type: TransactionType;
    description: string;
    date: Date;
    orgId: string;
    userId: string;
    categoryId?: string;
  }) {
    return prisma.transaction.create({
      data,
      include: { category: true, user: { select: { id: true, name: true } } },
    });
  },

  async findAll(filters: TransactionFilters) {
    const where: Prisma.TransactionWhereInput = {
      orgId: filters.orgId,
      deletedAt: null,
      ...(filters.type && { type: filters.type }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.startDate || filters.endDate
        ? {
            date: {
              ...(filters.startDate && { gte: new Date(filters.startDate) }),
              ...(filters.endDate && { lte: new Date(filters.endDate) }),
            },
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        include: { category: true, user: { select: { id: true, name: true } } },
        orderBy: { date: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data, total };
  },

  async findById(id: string, orgId: string) {
    return prisma.transaction.findFirst({
      where: { id, orgId, deletedAt: null },
      include: { category: true, user: { select: { id: true, name: true } } },
    });
  },

  async update(
    id: string,
    orgId: string,
    data: Partial<{
      amount: number;
      type: TransactionType;
      description: string;
      date: Date;
      categoryId: string | null;
    }>
  ) {
    return prisma.transaction.update({
      where: { id, orgId },
      data,
      include: { category: true, user: { select: { id: true, name: true } } },
    });
  },

  async softDelete(id: string, orgId: string) {
    return prisma.transaction.update({
      where: { id, orgId },
      data: { deletedAt: new Date() },
    });
  },

  async getForExport(orgId: string, filters: Omit<TransactionFilters, 'page' | 'limit'>) {
    const where: Prisma.TransactionWhereInput = {
      orgId,
      deletedAt: null,
      ...(filters.type && { type: filters.type }),
      ...(filters.startDate || filters.endDate
        ? {
            date: {
              ...(filters.startDate && { gte: new Date(filters.startDate) }),
              ...(filters.endDate && { lte: new Date(filters.endDate) }),
            },
          }
        : {}),
    };

    // Use a cursor-based approach for large exports
    return prisma.transaction.findMany({
      where,
      include: { category: { select: { name: true } }, user: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });
  },
};
