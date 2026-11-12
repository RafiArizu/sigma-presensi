export const sessionConfig = {
  cookieName: process.env.SESSION_COOKIE_NAME ?? 'sigma_session',
  secret: process.env.SESSION_SECRET ?? 'development-only-session-secret',
  lifetimeMinutes: Number(process.env.SESSION_LIFETIME_MINUTES ?? 120),
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.SESSION_COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none',
};
