import type { RequestHandler } from 'express';
import { UserModel, type UserRole } from '../models/UserModel.js';

export const requireAuthentication: RequestHandler = async (request, response, next) => {
  if (!request.session.userId) {
    response.status(401).json({ code: 'UNAUTHENTICATED', message: 'Autentikasi diperlukan' });
    return;
  }
  next();
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return async (request, response, next) => {
    try {
      if (!request.session.userId) {
        response.status(401).json({ code: 'UNAUTHENTICATED', message: 'Autentikasi diperlukan' });
        return;
      }

      const user = await UserModel.findById(request.session.userId);
      if (!user || user.status !== 'active') {
        request.session.destroy(() => undefined);
        response.status(401).json({ code: 'SESSION_INVALID', message: 'Sesi tidak valid' });
        return;
      }

      request.session.role = user.role;
      if (!roles.includes(user.role)) {
        response.status(403).json({ code: 'FORBIDDEN', message: 'Akses tidak diizinkan' });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
