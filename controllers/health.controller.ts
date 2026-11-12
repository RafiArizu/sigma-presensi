import type { RequestHandler } from 'express';
export const healthController: RequestHandler = (_req, res) => res.json({ service: 'sigma-presensi-api', status: 'ok', time: new Date().toISOString() });
