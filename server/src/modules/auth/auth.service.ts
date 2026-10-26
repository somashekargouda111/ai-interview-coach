import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';
import { env } from '../../config/env';
import { prisma } from '../../db/prisma';
import { AppError } from '../../utils/AppError';

const BCRYPT_COST = 12;
// Used to equalize timing when the email does not exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

export const toUserDto = (u: User) => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  targetRole: u.targetRole,
  experienceLevel: u.experienceLevel,
});

const signToken = (userId: string) =>
  jwt.sign({}, env.JWT_SECRET, { subject: userId, expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

export async function signup(input: {
  fullName: string;
  email: string;
  password: string;
  targetRole?: string;
  experienceLevel?: string;
}) {
  const existing = await prisma.user.findFirst({ where: { email: input.email } });
  if (existing) throw new AppError(409, 'CONFLICT', 'An account with this email already exists');
  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, BCRYPT_COST),
      targetRole: input.targetRole,
      experienceLevel: input.experienceLevel,
    },
  });
  return { token: signToken(user.id), user: toUserDto(user) };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  return { token: signToken(user.id), user: toUserDto(user) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(401, 'UNAUTHORIZED', 'Account no longer exists');
  return toUserDto(user);
}

export async function updateMe(
  userId: string,
  data: { fullName?: string; targetRole?: string | null; experienceLevel?: string | null },
) {
  return toUserDto(await prisma.user.update({ where: { id: userId }, data }));
}
