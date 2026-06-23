import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

import { PaymentStatus } from '../../../generated/prisma/enums'
import { PaymentsService } from './payments.service'
import { SslService } from './sslcommerz/ssl.service'

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

const initSSLCommerz = catchAsync(async (req, res) => {
	const { orderId } = req.body
	const order = await prisma.order.findUnique({ where: { id: orderId } })
	if (!order) throw new AppError(StatusCode.NOT_FOUND, 'Order not found.')

	const gatewayUrl = await SslService.initSSLCommerz({
		id: order.id,
		total: order.total,
		customerName: order.customerName,
		phone: order.phone,
		email: order.email ?? undefined,
	})

	// Store a Pending payment record
	await prisma.payment.upsert({
		where: { orderId_provider: { orderId: order.id, provider: 'sslcommerz' } },
		update: {},
		create: {
			orderId: order.id,
			provider: 'sslcommerz',
			method: 'sslcommerz',
			amount: order.total,
			status: PaymentStatus.PENDING,
		},
	})

	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Gateway URL ready',
		data: { gatewayUrl },
	})
})

const handleSSLCommerzIPN = catchAsync(async (req, res) => {
	const { tran_id, val_id, status } = req.body

	if (status !== 'VALID') {
		// Payment failed — update order and payment status
		await prisma.order.update({
			where: { id: tran_id },
			data: { paymentStatus: PaymentStatus.FAILED },
		})
		await prisma.payment.updateMany({
			where: { orderId: tran_id, provider: 'sslcommerz' },
			data: { status: PaymentStatus.FAILED },
		})
		res.status(200).send('IPN received')
		return
	}

	const isValid = await SslService.validateSSLCommerz(val_id)
	if (!isValid) {
		res.status(200).send('Validation failed')
		return
	}

	await prisma.order.update({
		where: { id: tran_id },
		data: { paymentStatus: PaymentStatus.COMPLETED },
	})
	await prisma.payment.updateMany({
		where: { orderId: tran_id, provider: 'sslcommerz' },
		data: {
			status: PaymentStatus.COMPLETED,
			providerTransactionId: val_id,
			verifiedAt: new Date(),
			verificationPayload: req.body as any,
		},
	})

	res.status(200).send('IPN received')
})

export const PaymentsController = {
	getPayments,
	getPaymentById,
	createPayment,
	updatePayment,
	initSSLCommerz,
	handleSSLCommerzIPN,
}

