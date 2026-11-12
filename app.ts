import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/health', healthRouter);
app.use((_req, res) => res.status(404).json({ code: 'NOT_FOUND', message: 'Route tidak ditemukan' }));
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => { console.error(err); res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan server' }); });
