import 'dotenv/config';

const secret = process.env.SESSION_SECRET ?? '';
const sameSite = (process.env.SESSION_COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none';

if (process.env.NODE_ENV === 'production' && secret.length < 32) {
  throw new Error('SESSION_SECRET must contain at least 32 characters in production');
}
if (sameSite === 'none' && process.env.NODE_ENV !== 'production') {
  throw new Error('SESSION_COOKIE_SAME_SITE=none requires production HTTPS');
}

export const sessionConfig = {
  cookieName: process.env.SESSION_COOKIE_NAME ?? 'sigma_session',
  secret: secret || 'development-only-session-secret-change-me',
  lifetimeMinutes: Number(process.env.SESSION_LIFETIME_MINUTES ?? 120),
  secure: process.env.NODE_ENV === 'production',
  sameSite,
};
