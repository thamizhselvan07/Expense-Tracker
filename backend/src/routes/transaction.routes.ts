import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, transactionSchema, transactionUpdateSchema } from '../middleware/validate';
import { rateLimit } from 'express-rate-limit';

const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Export limit reached. Try again in an hour.' },
});

export const transactionRouter = Router();

transactionRouter.use(authenticate);

transactionRouter.get('/', transactionController.getAll);
transactionRouter.get('/export', exportLimiter, transactionController.exportCsv);
transactionRouter.get('/:id', transactionController.getById);
transactionRouter.post('/', validate(transactionSchema), transactionController.create);
transactionRouter.patch(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(transactionUpdateSchema),
  transactionController.update
);
transactionRouter.delete(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  transactionController.delete
);
