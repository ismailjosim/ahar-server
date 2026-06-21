import type { Request, Response } from 'express'

import AppError from '@/helpers/AppError'
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

const uploadImage = catchAsync(async (req: Request, res: Response) => {
	const id = String(req.params.id)

	if (!req.file) {
		throw new AppError(StatusCode.BAD_REQUEST, 'No image file provided.')
	}

	// multer-storage-cloudinary attaches the Cloudinary secure URL to req.file.path
	const imageUrl = (req.file as Express.Multer.File & { path: string }).path

	const result = await MenuService.uploadMenuItemImage(id, imageUrl)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Menu item image uploaded successfully',
		data: result,
	})
})

export const MenuController = {
	createMenuItem,
	getMenuItems,
	getMenuItemById,
	updateMenuItem,
	deleteMenuItem,
	uploadImage,
}
