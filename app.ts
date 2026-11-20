import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import rateLimit from 'express-rate-limit';
import { pool } from './config/database.js';
import { sessionConfig } from './config/session.js';
import { requireSameOrigin } from './middlewares/security.middleware.js';
import { healthRouter } from './routes/health.routes.js';

const PgSession = connectPgSimple(session);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
const loginRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MINUTES ?? 15) * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_LOGIN_MAX_REQUESTS ?? 10),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { code: 'LOGIN_RATE_LIMITED', message: 'Terlalu banyak percobaan login. Coba lagi nanti.' },
});

export const app = express();

app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(helmet());
app.use(cors({ origin: frontendOrigin, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '1mb' }));
app.use(session({
  store: new PgSession({ pool, tableName: 'express_sessions', createTableIfMissing: false }),
  name: sessionConfig.cookieName,
  secret: sessionConfig.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: sessionConfig.secure,
    sameSite: sessionConfig.sameSite,
    maxAge: sessionConfig.lifetimeMinutes * 60 * 1000,
  },
}));

app.use('/api', requireSameOrigin);
app.use('/api/auth/login', loginRateLimiter);
app.use('/api', healthRouter);
app.use((_request, response) => response.status(404).json({ code: 'NOT_FOUND', message: 'Route tidak ditemukan' }));
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' });
});
