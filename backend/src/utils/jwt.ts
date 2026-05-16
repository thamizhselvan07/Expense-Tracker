import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface AccessTokenPayload {
  userId: string;
  orgId: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  type: 'refresh';
}

export function generateAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const options: SignOptions = { expiresIn: '15m' };
  return jwt.sign({ ...payload, type: 'access' }, ACCESS_SECRET, options);
}

export function generateRefreshToken(userId: string): { token: string; tokenId: string } {
  const tokenId = uuidv4();
  const options: SignOptions = { expiresIn: '7d' };
  const token = jwt.sign({ userId, tokenId, type: 'refresh' }, REFRESH_SECRET, options);
  return { token, tokenId };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
  if (payload.type !== 'refresh') throw new Error('Invalid token type');
  return payload;
}

export function getRefreshTokenExpiry(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}
