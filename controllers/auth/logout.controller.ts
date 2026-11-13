import type { RequestHandler } from 'express';

type LogoutController = {
  logout: RequestHandler;
};


const logout: RequestHandler = (request, response, next) => {
  request.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    response.clearCookie(
      process.env.SESSION_COOKIE_NAME ?? 'sigma_session',
      { path: '/login' },
    );
 
        response.status(204).send();
  });
};

export const logoutController: LogoutController = { logout };