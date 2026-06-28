import { Router } from 'express'
import validateRequest from '@/middlewares/validateRequest'

import { SettingsController } from './settings.controller'
import { SettingsValidation } from './settings.validation'

const router = Router()

router.get('/public', SettingsController.getPublicSettings)

// manager+ can read full settings
router.get('/', SettingsController.getSettings)

// owner+ can change settings
router.patch(
	'/',
	validateRequest(SettingsValidation.updateSettings),
	SettingsController.updateSettings,
)

export const SettingsRoutes = router
