import { Router } from 'express'

import { NotificationsController } from './notifications.controller'

const router = Router()

router.get('/', NotificationsController.getNotifications)
router.post('/', NotificationsController.createNotification)
router.patch('/:id/read', NotificationsController.markRead)

export const NotificationsRoutes = router
