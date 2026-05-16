import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const dashboardController = {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as AuthenticatedRequest).user;
      const year = parseInt((req.query.year as string) ?? String(new Date().getFullYear()));
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const data = await dashboardService.getSummary(orgId, year, month);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getMonthlyTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const { orgId } = (req as AuthenticatedRequest).user;
      const year = parseInt((req.query.year as string) ?? String(new Date().getFullYear()));
      const data = await dashboardService.getMonthlyTrend(orgId, year);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
