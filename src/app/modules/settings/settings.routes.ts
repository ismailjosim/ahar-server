import { Router } from 'express'

import { requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'

import { SettingsController } from './settings.controller'

const router = Router()

// manager+ can read full settings
router.get(
	'/',
	requireAuth,
	requireRole('manager'),
	SettingsController.getSettings,
)

// owner+ can change settings
router.patch(
	'/',
	requireAuth,
	requireRole('owner'),
	SettingsController.updateSettings,
)

export const SettingsRoutes = router
