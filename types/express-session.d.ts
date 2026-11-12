import type { UserRole } from '../models/UserModel.js';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    role?: UserRole;
  }
}
