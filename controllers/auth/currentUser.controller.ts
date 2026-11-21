import type { RequestHandler } from 'express';
import { UserModel } from '../../models/UserModel.js';

type currentUser = {
  currentUser: RequestHandler;
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

    response.json({ user: { id: user.id, name: user.user_name, user_name: user.user_name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

export const currentUserController: currentUser = { currentUser };

