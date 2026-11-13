import { Router } from 'express';
import { currentUserController } from '../controllers/auth/currentUser.controller.js';
import { loginController } from '../controllers/auth/login.controller.js';
import { logoutController } from '../controllers/auth/logout.controller.js';
import { healthController } from '../controllers/health.controller.js';
import {requireAuthentication,requireRole,} from '../middlewares/auth.middleware.js';

export const healthRouter = Router();

// METHOD GET, POST DAN API

healthRouter.get('/health', healthController);

healthRouter.post('/auth/login', loginController.login);

healthRouter.get('/auth/currentUser',requireAuthentication,currentUserController.currentUser,);

healthRouter.post('/auth/logout',requireAuthentication,logoutController.logout,);

healthRouter.get('/pages/login', (_request, response) => {response.json({ path: '/auth/login', page: 'Login' });});

healthRouter.get('/admin/dashboard',requireAuthentication,requireRole('super_admin'),(_request, response) => {response.json({page: 'admin-dashboard',role: 'super_admin',});},);