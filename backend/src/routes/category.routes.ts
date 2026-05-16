import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, categorySchema } from '../middleware/validate';

export const categoryRouter = Router();

categoryRouter.use(authenticate);
categoryRouter.get('/', categoryController.getAll);
categoryRouter.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validate(categorySchema), categoryController.create);
categoryRouter.delete('/:id', requireRole('ADMIN'), categoryController.delete);
