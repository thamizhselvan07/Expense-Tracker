import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    orgId: string;
    role: Role;
  };
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = {
      userId: payload.userId,
      orgId: payload.orgId,
      role: payload.role as Role,
    };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { role } = (req as AuthenticatedRequest).user;
    if (!roles.includes(role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
}
