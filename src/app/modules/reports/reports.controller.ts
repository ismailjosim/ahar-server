import catchAsync from '@/shared/catchAsync'

import { ReportsService } from './reports.service'

const exportCsv = catchAsync(async (req, res) => {
	const csv = await ReportsService.exportCsv(
		String(req.query.type || 'orders'),
	)
	res.setHeader('Content-Type', 'text/csv; charset=utf-8')
	res.setHeader(
		'Content-Disposition',
		'attachment; filename="ahar-report.csv"',
	)
	res.send(csv)
})

export const ReportsController = {
	exportCsv,
}
