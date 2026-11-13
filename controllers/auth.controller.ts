import type { RequestHandler } from 'express';
import { UserModel } from '../models/UserModel.js';

type AuthController = {
  currentUser: RequestHandler;
  logout: RequestHandler;
};

const currentUser: RequestHandler = async (request, response, next) => {
  try {
    if (!request.session.userId) {
      response.status(401).json({ code: 'UNAUTHENTICATED', message: 'Sesi tidak ditemukan' });
      return;
    }

    const user = await UserModel.findById(request.session.userId);
    if (!user || user.status !== 'active') {
      request.session.destroy(() => undefined);
      response.status(401).json({ code: 'SESSION_INVALID', message: 'Sesi tidak valid' });
      return;
    }

    response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

const logout: RequestHandler = (request, response, next) => {
  request.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    response.clearCookie(process.env.SESSION_COOKIE_NAME ?? 'sigma_session');
    response.status(204).send();
  });
};

export const authController: AuthController = { currentUser, logout };