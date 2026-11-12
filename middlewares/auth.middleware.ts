import type { RequestHandler } from 'express';
import type { UserRole } from '../models/UserModel.js';

export const requireAuthentication: RequestHandler = (request, response, next) => {
  if (!request.session.userId) {
    response.status(401).json({ code: 'UNAUTHENTICATED', message: 'Autentikasi diperlukan' });
    return;
  }

  next();
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (request, response, next) => {
    if (!request.session.role || !roles.includes(request.session.role)) {
      response.status(403).json({ code: 'FORBIDDEN', message: 'Akses tidak diizinkan' });
      return;
    }

    next();
  };
}
