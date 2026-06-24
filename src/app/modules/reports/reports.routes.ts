import { Router } from 'express'

import { requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'

import { ReportsController } from './reports.controller'

const router = Router()

// manager+ can fetch summary stats with date range
router.get(
	'/summary',
	requireAuth,
	requireRole('manager'),
	ReportsController.getSummaryStats,
)

// manager+ can export reports
router.get(
	'/export',
	requireAuth,
	requireRole('manager'),
	ReportsController.exportCsv,
)

// manager+ can fetch dashboard stats
router.get(
	'/stats',
	requireAuth,
	requireRole('manager'),
	ReportsController.getDashboardStats,
)

export const ReportsRoutes = router
