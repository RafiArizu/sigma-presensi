import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UserModel } from '../../models/UserModel.js';
import { verifyPassword } from '../../services/password.js';

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

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

export const loginController: { login: RequestHandler } = { login };