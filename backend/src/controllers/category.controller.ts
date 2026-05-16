import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const categoryController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as AuthenticatedRequest).user;
      const categories = await prisma.category.findMany({
        where: { orgId },
        orderBy: { name: 'asc' },
      });
      res.json(categories);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as AuthenticatedRequest).user;
      const category = await prisma.category.create({
        data: { ...req.body, orgId },
      });
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as AuthenticatedRequest).user;
      await prisma.category.delete({
        where: { id: req.params.id as string, orgId },
      });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
