import type { RequestHandler } from 'express';

type LogoutController = { logout: RequestHandler };

const logout: RequestHandler = (request, response, next) => {
  request.session.destroy((error) => {
    if (error) { next(error); return; }
    response.clearCookie(process.env.SESSION_COOKIE_NAME ?? 'sigma_session', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.SESSION_COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none',
    });
    response.status(204).send();
  });
};

export const logoutController: LogoutController = { logout };
