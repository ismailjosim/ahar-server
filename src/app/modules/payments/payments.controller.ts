import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

import { PaymentsService } from './payments.service'

const getPayments = catchAsync(async (req, res) => {
	const result = await PaymentsService.getPayments(req.query)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Payments retrieved successfully',
		meta: {
			page: result.page,
			limit: result.limit,
			total: result.total,
		},
		data: result.data,
	})
})

const getPaymentById = catchAsync(async (req, res) => {
	const result = await PaymentsService.getPaymentById(String(req.params.id))
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Payment retrieved successfully',
		data: result,
	})
})

const createPayment = catchAsync(async (req, res) => {
	const result = await PaymentsService.createPayment(req.body)
	sendResponse(res, {
		statusCode: StatusCode.CREATED,
		success: true,
		message: 'Payment created successfully',
		data: result,
	})
})

const updatePayment = catchAsync(async (req, res) => {
	const result = await PaymentsService.updatePayment(
		String(req.params.id),
		req.body,
	)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Payment updated successfully',
		data: result,
	})
})

export const PaymentsController = {
	getPayments,
	getPaymentById,
	createPayment,
	updatePayment,
}
