import { Router } from 'express'

import { requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'
import validateRequest from '@/middlewares/validateRequest'

import { SettingsController } from './settings.controller'
import { SettingsValidation } from './settings.validation'

const router = Router()

router.get('/public', SettingsController.getPublicSettings)

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
	validateRequest(SettingsValidation.updateSettings),
	SettingsController.updateSettings,
)

export const SettingsRoutes = router
