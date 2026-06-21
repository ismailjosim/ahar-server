import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

import { OrdersService } from './orders.service'

const getOrders = catchAsync(async (req, res) => {
	const result = await OrdersService.getOrders(req.query)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Orders retrieved successfully',
		meta: {
			page: result.page,
			limit: result.limit,
			total: result.total,
		},
		data: result.data,
	})
})

const getOrderById = catchAsync(async (req, res) => {
	const result = await OrdersService.getOrderById(String(req.params.id))
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Order retrieved successfully',
		data: result,
	})
})

const createOrder = catchAsync(async (req, res) => {
	const result = await OrdersService.createOrder({
		...req.body,
		userId: req.user?.id,
	})
	sendResponse(res, {
		statusCode: StatusCode.CREATED,
		success: true,
		message: 'Order created successfully',
		data: result,
	})
})

const updateOrderStatus = catchAsync(async (req, res) => {
	const result = await OrdersService.updateOrderStatus(
		String(req.params.id),
		String(req.body.status),
	)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Order updated successfully',
		data: result,
	})
})

export const OrdersController = {
	getOrders,
	getOrderById,
	createOrder,
	updateOrderStatus,
}
