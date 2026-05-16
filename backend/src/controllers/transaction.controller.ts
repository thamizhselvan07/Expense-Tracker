import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { AuthenticatedRequest } from '../middleware/auth';
import { TransactionType } from '@prisma/client';

export const transactionController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, orgId } = (req as AuthenticatedRequest).user;
      const tx = await transactionService.create({ ...req.body, userId, orgId });
      res.status(201).json(tx);
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as AuthenticatedRequest).user;
      const query = req.query as Record<string, string>;

      const result = await transactionService.getAll({
        orgId,
        page: parseInt(query.page ?? '1'),
        limit: Math.min(parseInt(query.limit ?? '20'), 100),
        type: query.type as TransactionType | undefined,
        categoryId: query.categoryId,
        startDate: query.startDate,
        endDate: query.endDate,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as AuthenticatedRequest).user;
      const tx = await transactionService.getById(req.params.id as string, orgId);
      res.json(tx);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as AuthenticatedRequest).user;
      const tx = await transactionService.update(req.params.id as string, orgId, req.body);
      res.json(tx);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as AuthenticatedRequest).user;
      await transactionService.delete(req.params.id as string, orgId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as AuthenticatedRequest).user;
      const query = req.query as Record<string, string>;
      await transactionService.exportCsv(
        orgId,
        {
          orgId,
          type: query.type as TransactionType | undefined,
          startDate: query.startDate,
          endDate: query.endDate,
        },
        res
      );
    } catch (err) {
      next(err);
    }
  },
};
