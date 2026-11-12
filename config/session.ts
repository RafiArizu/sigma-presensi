export const sessionConfig = { cookieName: process.env.SESSION_COOKIE_NAME ?? 'sigma_session', secure: process.env.NODE_ENV === 'production' };
