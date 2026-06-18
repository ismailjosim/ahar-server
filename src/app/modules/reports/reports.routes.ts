import { Router } from 'express'

import { ReportsController } from './reports.controller'

const router = Router()

router.get('/export', ReportsController.exportCsv)

export const ReportsRoutes = router
