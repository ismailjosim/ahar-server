import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

import { NotificationsService } from './notifications.service'

const getNotifications = catchAsync(async (req, res) => {
	const result = await NotificationsService.getNotifications(req.query)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Notifications retrieved successfully',
		meta: {
			page: result.page,
			limit: result.limit,
			total: result.total,
		},
		data: result.data,
	})
})

const createNotification = catchAsync(async (req, res) => {
	const result = await NotificationsService.createNotification(req.body)
	sendResponse(res, {
		statusCode: StatusCode.CREATED,
		success: true,
		message: 'Notification created successfully',
		data: result,
	})
})

const markRead = catchAsync(async (req, res) => {
	const result = await NotificationsService.markRead(String(req.params.id))
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Notification marked as read',
		data: result,
	})
})

export const NotificationsController = {
	getNotifications,
	createNotification,
	markRead,
}
