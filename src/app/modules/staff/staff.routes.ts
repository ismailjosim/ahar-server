import { Router } from 'express'
import { StaffController } from './staff.controller'

const router = Router()

// Public invite-validation routes
router.get('/invite/:token', StaffController.acceptInvite)
router.patch('/invite/:token/use', StaffController.markInviteUsed)

// Super admin only routes
router.get('/', StaffController.listStaff)
router.post(
	'/invite',

	StaffController.inviteStaff,
)
router.patch(
	'/:id/role',

	StaffController.updateStaffRole,
)
router.patch(
	'/:id/active',

	StaffController.toggleActive,
)

export const StaffRoutes = router
