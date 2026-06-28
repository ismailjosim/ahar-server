import { Router } from 'express'

import { ReportsController } from './reports.controller'

const router = Router()

// manager+ can fetch summary stats with date range
router.get('/summary', ReportsController.getSummaryStats)

// manager+ can export reports
router.get('/export', ReportsController.exportCsv)

// manager+ can fetch dashboard stats
router.get('/stats', ReportsController.getDashboardStats)

export const ReportsRoutes = router
