import type { RequestHandler } from 'express';
import { UserModel } from '../../models/UserModel.js';
import {l}

type Logout = {
  logout: RequestHandler;
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