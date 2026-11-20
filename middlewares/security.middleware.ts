import type { RequestHandler } from 'express';

const stateChangingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const requireSameOrigin: RequestHandler = (request, response, next) => {
  if (!stateChangingMethods.has(request.method)) {
    next();
    return;
  }

  const expectedOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
  const origin = request.get('origin');
  const referer = request.get('referer');
  let suppliedOrigin = origin ?? null;

  if (!suppliedOrigin && referer) {
    try {
      suppliedOrigin = new URL(referer).origin;
    } catch {
      suppliedOrigin = null;
    }
  }

  if (suppliedOrigin !== expectedOrigin) {
    response.status(403).json({ code: 'INVALID_ORIGIN', message: 'Origin request tidak diizinkan' });
    return;
  }

  next();
};
