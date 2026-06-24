import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

import { ReportsService } from './reports.service'

const exportCsv = catchAsync(async (req, res) => {
	const csv = await ReportsService.exportCsv(
		String(req.query.type || 'orders'),
		String(req.query.from || ''),
		String(req.query.to || ''),
	)
	res.setHeader('Content-Type', 'text/csv; charset=utf-8')
	res.setHeader(
		'Content-Disposition',
		'attachment; filename="ahar-report.csv"',
	)
	res.send(csv)
})

const getDashboardStats = catchAsync(async (req, res) => {
	const data = await ReportsService.getDashboardStats()
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Dashboard stats',
		data,
	})
})

const getSummaryStats = catchAsync(async (req, res) => {
	const data = await ReportsService.getSummaryStats(
		String(req.query.from || ''),
		String(req.query.to || ''),
	)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Summary stats',
		data,
	})
})

export const ReportsController = {
	exportCsv,
	getDashboardStats,
	getSummaryStats,
}
