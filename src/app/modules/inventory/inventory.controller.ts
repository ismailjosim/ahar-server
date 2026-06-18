import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

import { InventoryService } from './inventory.service'

const getInventoryItems = catchAsync(async (req, res) => {
	const result = await InventoryService.getInventoryItems(req.query)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Inventory items retrieved successfully',
		meta: {
			page: result.page,
			limit: result.limit,
			total: result.total,
		},
		data: result.data,
	})
})

const getInventoryItemById = catchAsync(async (req, res) => {
	const result = await InventoryService.getInventoryItemById(
		String(req.params.id),
	)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Inventory item retrieved successfully',
		data: result,
	})
})

const createInventoryItem = catchAsync(async (req, res) => {
	const result = await InventoryService.createInventoryItem(req.body)
	sendResponse(res, {
		statusCode: StatusCode.CREATED,
		success: true,
		message: 'Inventory item created successfully',
		data: result,
	})
})

const updateInventoryItem = catchAsync(async (req, res) => {
	const result = await InventoryService.updateInventoryItem(
		String(req.params.id),
		req.body,
	)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Inventory item updated successfully',
		data: result,
	})
})

const deleteInventoryItem = catchAsync(async (req, res) => {
	await InventoryService.deleteInventoryItem(String(req.params.id))
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Inventory item deleted successfully',
		data: null,
	})
})

export const InventoryController = {
	getInventoryItems,
	getInventoryItemById,
	createInventoryItem,
	updateInventoryItem,
	deleteInventoryItem,
}
