import { TransactionType } from '@prisma/client';
import { transactionRepository, TransactionFilters } from '../repositories/transaction.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { format } from '@fast-csv/format';
import { Response } from 'express';

export const transactionService = {
  async create(data: {
    amount: number;
    type: TransactionType;
    description: string;
    date: string;
    categoryId?: string;
    orgId: string;
    userId: string;
  }) {
    return transactionRepository.create({
      ...data,
      date: new Date(data.date),
    });
  },

  async getAll(filters: TransactionFilters) {
    const { data, total } = await transactionRepository.findAll(filters);
    const totalPages = Math.ceil(total / filters.limit);
    return {
      data,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages,
        hasNext: filters.page < totalPages,
        hasPrev: filters.page > 1,
      },
    };
  },

  async getById(id: string, orgId: string) {
    const tx = await transactionRepository.findById(id, orgId);
    if (!tx) throw new NotFoundError('Transaction');
    return tx;
  },

  async update(
    id: string,
    orgId: string,
    data: Partial<{
      amount: number;
      type: TransactionType;
      description: string;
      date: string;
      categoryId: string | null;
    }>
  ) {
    const tx = await transactionRepository.findById(id, orgId);
    if (!tx) throw new NotFoundError('Transaction');

    return transactionRepository.update(id, orgId, {
      ...data,
      ...(data.date ? { date: new Date(data.date) } : {}),
    });
  },

  async delete(id: string, orgId: string) {
    const tx = await transactionRepository.findById(id, orgId);
    if (!tx) throw new NotFoundError('Transaction');
    await transactionRepository.softDelete(id, orgId);
  },

  async exportCsv(
    orgId: string,
    filters: Omit<TransactionFilters, 'page' | 'limit'>,
    res: Response
  ) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="transactions-${Date.now()}.csv"`
    );

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    // Stream records in batches to avoid memory overload
    const BATCH_SIZE = 500;
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const transactions = await transactionRepository.getForExport(orgId, {
        ...filters,
      });

      for (const tx of transactions) {
        csvStream.write({
          id: tx.id,
          date: tx.date.toISOString().split('T')[0],
          type: tx.type,
          amount: tx.amount.toString(),
          description: tx.description,
          category: tx.category?.name ?? '',
          createdBy: tx.user?.name ?? '',
          createdAt: tx.createdAt.toISOString(),
        });
      }

      hasMore = false; // Simple export; enhance with cursor for true streaming
    }

    csvStream.end();
  },
};
