import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UserModel } from '../models/UserModel.js';
import { verifyPassword } from '../services/password.js';

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

type AuthController = {
  login: RequestHandler;
  currentUser: RequestHandler;
  logout: RequestHandler;
};

const login: RequestHandler = async (request, response, next) => {
  try {
    const input = loginSchema.safeParse(request.body);
    if (!input.success) {
      response.status(400).json({ code: 'INVALID_LOGIN_INPUT', message: 'Email dan password tidak valid' });
      return;
    }

    const user = await UserModel.findByEmail(input.data.email);
    const passwordMatches = user?.password_hash
      ? await verifyPassword(user.password_hash, input.data.password)
      : false;

    if (!user || user.status !== 'active' || !passwordMatches) {
      response.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Email atau password salah' });
      return;
    }

    request.session.regenerate((error) => {
      if (error) {
        next(error);
        return;
      }

      request.session.userId = user.id;
      request.session.role = user.role;
      response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (error) {
    next(error);
  }
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

export const authController: AuthController = { login, currentUser, logout };
