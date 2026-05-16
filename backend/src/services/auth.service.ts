import bcrypt from 'bcryptjs';
import { authRepository } from '../repositories/auth.repository';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  verifyRefreshToken,
} from '../utils/jwt';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 12;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  // In production, check DB for uniqueness and append suffix if needed
  return `${base}-${Date.now()}`;
}

export const authService = {
  async register(data: {
    email: string;
    password: string;
    name: string;
    orgName: string;
  }) {
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const orgSlug = await generateUniqueSlug(data.orgName);

    const { user } = await authRepository.createOrgAndAdmin({
      ...data,
      passwordHash,
      orgSlug,
    });

    logger.info({ userId: user.id, orgId: user.orgId }, 'New user registered');

    const tokens = await authService._issueTokens(user.id, user.orgId, user.role);
    return { user: sanitizeUser(user), ...tokens };
  },

  async login(email: string, password: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    await authRepository.updateLastLogin(user.id);
    logger.info({ userId: user.id }, 'User logged in');

    const tokens = await authService._issueTokens(user.id, user.orgId, user.role);
    return { user: sanitizeUser(user), ...tokens };
  },

  async refreshTokens(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await authRepository.findAndConsumeRefreshToken(refreshToken);

    if (!stored || stored.userId !== payload.userId) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await authRepository.findUserById(stored.userId);
    if (!user) throw new NotFoundError('User');

    const tokens = await authService._issueTokens(user.id, user.orgId, user.role);
    return tokens;
  },

  async logout(userId: string) {
    await authRepository.revokeAllUserTokens(userId);
    logger.info({ userId }, 'User logged out');
  },

  async _issueTokens(userId: string, orgId: string, role: string) {
    const accessToken = generateAccessToken({ userId, orgId, role });
    const { token: refreshToken, tokenId } = generateRefreshToken(userId);
    await authRepository.storeRefreshToken({
      token: refreshToken,
      tokenId,
      userId,
      expiresAt: getRefreshTokenExpiry(),
    });
    return { accessToken, refreshToken };
  },
};

function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
  organization?: { id: string; name: string; slug: string };
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    orgId: user.orgId,
    organization: user.organization,
  };
}
