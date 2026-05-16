import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const authRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { organization: { select: { id: true, name: true, slug: true } } },
    });
  },

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { organization: { select: { id: true, name: true, slug: true } } },
    });
  },

  async createOrgAndAdmin(data: {
    email: string;
    passwordHash: string;
    name: string;
    orgName: string;
    orgSlug: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: data.orgName, slug: data.orgSlug },
      });
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          name: data.name,
          role: 'ADMIN',
          orgId: org.id,
        },
        include: { organization: { select: { id: true, name: true, slug: true } } },
      });
      return { org, user };
    });
  },

  async storeRefreshToken(data: {
    token: string;
    tokenId: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({
      data: {
        id: data.tokenId,
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  },

  async findAndConsumeRefreshToken(token: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.refreshToken.findUnique({ where: { token } });
      if (!existing) return null;
      if (existing.usedAt || existing.revokedAt) {
        // Token reuse detected — revoke all tokens for this user
        await tx.refreshToken.updateMany({
          where: { userId: existing.userId },
          data: { revokedAt: new Date() },
        });
        return null;
      }
      if (existing.expiresAt < new Date()) return null;

      await tx.refreshToken.update({
        where: { id: existing.id },
        data: { usedAt: new Date() },
      });
      return existing;
    });
  },

  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  },
};
