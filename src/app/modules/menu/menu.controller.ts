import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

import { MenuService } from './menu.service'

const createMenuItem = catchAsync(async (req, res) => {
	const result = await MenuService.createMenuItem(req.body)

	sendResponse(res, {
		statusCode: StatusCode.CREATED,
		success: true,
		message: 'Menu item created successfully',
		data: result,
	})
})

const getMenuItems = catchAsync(async (req, res) => {
	const result = await MenuService.getMenuItems(req.query)

	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Menu items retrieved successfully',
		meta: result.meta,
		data: result.data,
	})
})

const getMenuItemById = catchAsync(async (req, res) => {
	const result = await MenuService.getMenuItemById(String(req.params.id))

	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Menu item retrieved successfully',
		data: result,
	})
})

const updateMenuItem = catchAsync(async (req, res) => {
	const result = await MenuService.updateMenuItem(
		String(req.params.id),
		req.body,
	)

	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Menu item updated successfully',
		data: result,
	})
})

const deleteMenuItem = catchAsync(async (req, res) => {
	await MenuService.deleteMenuItem(String(req.params.id))

	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Menu item deleted successfully',
		data: null,
	})
})

export const MenuController = {
	createMenuItem,
	getMenuItems,
	getMenuItemById,
	updateMenuItem,
	deleteMenuItem,
}
