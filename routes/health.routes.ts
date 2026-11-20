import { Router } from 'express';
import { currentUserController } from '../controllers/auth/CurrentUser.controller.js';
import { loginController } from '../controllers/auth/Login.controller.js';
import { logoutController } from '../controllers/auth/Logout.controller.js';
import { userController } from '../controllers/admin/User.controller.js';
import { dashboardStatsController } from '../controllers/admin/Dashboard.controller.js';
import { locationController } from '../controllers/admin/Location.controller.js';
import { healthController } from '../controllers/Health.controller.js';
import { requireAuthentication, requireRole } from '../middlewares/auth.middleware.js';

export const healthRouter = Router();
const superAdminOnly = [requireAuthentication, requireRole('super_admin')];

healthRouter.get('/health', healthController);
healthRouter.post('/auth/login', loginController.login);
healthRouter.get('/auth/currentUser', requireAuthentication, currentUserController.currentUser);
healthRouter.post('/auth/logout', requireAuthentication, logoutController.logout);
healthRouter.get('/admin/dashboard/stats', ...superAdminOnly, dashboardStatsController);
healthRouter.get('/admin/users', ...superAdminOnly, userController.list);
healthRouter.get('/admin/users/:id', ...superAdminOnly, userController.detail);
healthRouter.post('/admin/users', ...superAdminOnly, userController.create);
healthRouter.put('/admin/users/:id', ...superAdminOnly, userController.update);
healthRouter.delete('/admin/users/:id', ...superAdminOnly, userController.remove);
healthRouter.get('/admin/locations', ...superAdminOnly, locationController.list);
healthRouter.get('/admin/locations/:id', ...superAdminOnly, locationController.detail);
healthRouter.post('/admin/locations', ...superAdminOnly, locationController.create);
healthRouter.put('/admin/locations/:id', ...superAdminOnly, locationController.update);
healthRouter.delete('/admin/locations/:id', ...superAdminOnly, locationController.remove);

healthRouter.get('/pages/login', (_request, response) => {
  response.json({ path: '/auth/login', page: 'Login' });
});

healthRouter.get('/super-admin/dashboard', ...superAdminOnly, (_request, response) => {
  response.json({ page: 'super-admin-dashboard', role: 'super_admin' });
});

healthRouter.get('/admin/dashboard', ...superAdminOnly, (_request, response) => {
  response.json({ page: 'super-admin-dashboard', role: 'super_admin' });
});

