import { Router } from 'express'
import validateRequest from '@/middlewares/validateRequest'

import { NotificationsController } from './notifications.controller'
import { NotificationsValidation } from './notifications.validation'

const router = Router()

// cashier+ can read and mark notifications
router.get('/', NotificationsController.getNotifications)
router.patch('/:id/read', NotificationsController.markRead)

// manager+ can create notifications (system events)
router.post(
	'/',
	validateRequest(NotificationsValidation.createNotification),
	NotificationsController.createNotification,
)

export const NotificationsRoutes = router
