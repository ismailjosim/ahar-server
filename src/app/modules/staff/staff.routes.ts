import { UserRole } from '@generated/prisma/enums';
import { Router } from 'express';

import { checkAuth } from '@/middlewares/checkAuth';

import { StaffController } from './staff.controller';

const router = Router();

// Public invite-validation routes
router.get('/invite/:token', StaffController.acceptInvite);
router.patch('/invite/:token/use', StaffController.markInviteUsed);

// Super admin only routes
router.get('/', checkAuth(UserRole.SUPER_ADMIN), StaffController.listStaff);
router.post('/invite', checkAuth(UserRole.SUPER_ADMIN), StaffController.inviteStaff);
router.patch('/:id/role', checkAuth(UserRole.SUPER_ADMIN), StaffController.updateStaffRole);
router.patch('/:id/active', checkAuth(UserRole.SUPER_ADMIN), StaffController.toggleActive);

export const StaffRoutes = router;
