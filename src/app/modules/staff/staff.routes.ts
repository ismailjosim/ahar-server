import { Router } from 'express'

import { requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'

import { StaffController } from './staff.controller'

const router = Router()

// Public invite-validation routes
router.get('/invite/:token', StaffController.acceptInvite)
router.patch('/invite/:token/use', StaffController.markInviteUsed)

// Super admin only routes
router.get('/', requireAuth, requireRole('super_admin'), StaffController.listStaff)
router.post('/invite', requireAuth, requireRole('super_admin'), StaffController.inviteStaff)
router.patch('/:id/role', requireAuth, requireRole('super_admin'), StaffController.updateStaffRole)
router.patch('/:id/active', requireAuth, requireRole('super_admin'), StaffController.toggleActive)

export const StaffRoutes = router
