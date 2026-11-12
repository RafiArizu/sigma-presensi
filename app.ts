import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import { sessionConfig } from './config/session.js';
import { healthRouter } from './routes/health.routes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(session({
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

app.use('/api', healthRouter);
app.use((_request, response) => response.status(404).json({ code: 'NOT_FOUND', message: 'Route tidak ditemukan' }));
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' });
});


