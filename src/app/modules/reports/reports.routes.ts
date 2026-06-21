import { Router } from 'express'

import { requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'

import { ReportsController } from './reports.controller'

const router = Router()

// manager+ can export reports
router.get(
	'/export',
	requireAuth,
	requireRole('manager'),
	ReportsController.exportCsv,
)

export const ReportsRoutes = router
