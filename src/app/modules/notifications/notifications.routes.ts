import { Router } from 'express'

import { requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'

import { NotificationsController } from './notifications.controller'

const router = Router()

// cashier+ can read and mark notifications
router.get(
	'/',
	requireAuth,
	requireRole('cashier'),
	NotificationsController.getNotifications,
)
router.patch(
	'/:id/read',
	requireAuth,
	requireRole('cashier'),
	NotificationsController.markRead,
)

// manager+ can create notifications (system events)
router.post(
	'/',
	requireAuth,
	requireRole('manager'),
	NotificationsController.createNotification,
)

export const NotificationsRoutes = router
