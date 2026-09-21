import { UserRole, UserStatus } from '@generated/prisma/enums';
import type { NextFunction, Request, Response } from 'express';

import { envVars } from '@/config/env';
import { JWKS } from '@/config/jwks';
import { prisma } from '@/config/prisma.config';
import AppError from '@/helpers/AppError';
import { AuthPayload } from '@/interfaces/auth';
import StatusCode from '@/utils/statusCode';

declare module 'express' {
  interface Request {
    user?: AuthPayload;
  }
}

async function resolveUserFromRequest(req: Request): Promise<AuthPayload | null> {
  const internalSecret = req.headers['x-internal-secret'];
  const internalUserId = req.headers['x-auth-user-id'] as string | undefined;

  // 1. Internal secret from frontend proxy
  if (internalSecret && internalSecret === envVars.BETTER_AUTH_SECRET && internalUserId) {
    const user = await prisma.user.findUnique({
      where: { id: internalUserId },
    });

    if (!user) {
      throw new AppError(StatusCode.NOT_FOUND, 'User does not exist');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new AppError(StatusCode.FORBIDDEN, 'User is blocked');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.status === UserStatus.ACTIVE,
      phone: user.phone,
    };
  }

  // 2. Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const { jwtVerify } = await import('jose-cjs');
    const { payload } = await jwtVerify(token, await JWKS, {
      issuer: `${envVars.FRONTEND_URL}/api/auth`,
    });

    const email = payload.email as string;
    if (!email) {
      throw new AppError(StatusCode.UNAUTHORIZED, 'Invalid token payload');
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(StatusCode.NOT_FOUND, 'User does not exist');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new AppError(StatusCode.FORBIDDEN, 'User is blocked');
    }

    return {
      ...payload,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.status === UserStatus.ACTIVE,
      phone: user.phone,
    };
  }

  return null;
}

export const checkAuth =
  (...authRoles: (UserRole | string)[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await resolveUserFromRequest(req);

      if (!user) {
        throw new AppError(StatusCode.UNAUTHORIZED, 'Authentication required');
      }

      if (authRoles.length > 0) {
        const normalizedRole = user.role.toUpperCase();
        const allowedRoles = authRoles.map((r) => r.toUpperCase());

        if (!allowedRoles.includes(normalizedRole)) {
          throw new AppError(StatusCode.FORBIDDEN, 'Access denied');
        }
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await resolveUserFromRequest(req);
    if (user) {
      req.user = user;
    }
    next();
  } catch {
    // Optional auth does not block guest requests on auth failures
    next();
  }
};

export default checkAuth;
