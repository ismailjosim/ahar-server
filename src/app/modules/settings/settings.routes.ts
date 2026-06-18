import { Router } from 'express'

import { SettingsController } from './settings.controller'

const router = Router()

router.get('/', SettingsController.getSettings)
router.patch('/', SettingsController.updateSettings)

export const SettingsRoutes = router
