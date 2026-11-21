import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UserModel } from '../../models/UserModel.js';
import { verifyPassword } from '../../services/password.js';

const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(128),
});

const login: RequestHandler = async (request, response, next) => {
  try {
    const input = loginSchema.safeParse(request.body);
    if (!input.success) {
      response.status(400).json({ code: 'INVALID_LOGIN_INPUT', message: 'Username/email dan password tidak valid' });
      return;
    }

    const user = input.data.identifier.includes('@')
      ? await UserModel.findByEmail(input.data.identifier)
      : await UserModel.findByUsername(input.data.identifier);
    const passwordMatches = user?.password_hash
      ? await verifyPassword(user.password_hash, input.data.password)
      : false;

    if (!user || user.status !== 'active' || !passwordMatches) {
      response.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Username/email atau password salah' });
      return;
    }

    request.session.regenerate((error) => {
      if (error) { next(error); return; }
      request.session.userId = user.id;
      request.session.role = user.role;
      response.json({ user: { id: user.id, name: user.user_name, user_name: user.user_name, email: user.email, role: user.role } });
    });
  } catch (error) { next(error); }
};

export const loginController: { login: RequestHandler } = { login };


