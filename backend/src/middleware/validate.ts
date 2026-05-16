import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(2).max(100),
    orgName: z.string().min(2).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const transactionSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').max(999999999.99),
    type: z.enum(['INCOME', 'EXPENSE']),
    description: z.string().min(1).max(500),
    date: z.string().datetime(),
    categoryId: z.string().cuid().optional(),
  }),
});

export const transactionUpdateSchema = z.object({
  body: z.object({
    amount: z.number().positive().max(999999999.99).optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    description: z.string().min(1).max(500).optional(),
    date: z.string().datetime().optional(),
    categoryId: z.string().cuid().optional().nullable(),
  }),
});

export const transactionQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().cuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    cursor: z.string().optional(),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['INCOME', 'EXPENSE']),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
});

export const dashboardQuerySchema = z.object({
  query: z.object({
    year: z.coerce.number().int().min(2000).max(2100).default(new Date().getFullYear()),
    month: z.coerce.number().int().min(1).max(12).optional(),
  }),
});

// Middleware factory
export function validate(schema: z.ZodType) {
  return (req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  };
}
