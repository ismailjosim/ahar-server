import type { Request, Response } from 'express'

import AppError from '@/helpers/AppError'
import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'
import { CategoryService } from './category.service'



const createCategory = catchAsync(async (req: Request, res: Response) => {
	const result = await CategoryService.createCategory(req)

	sendResponse(res, {
		statusCode: StatusCode.CREATED,
		success: true,
		message: 'Category created successfully',
		data: result,
	})
})

const getCategories = catchAsync(async (req: Request, res: Response) => {
	const result = await CategoryService.getCategories(req.query)

	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Categories retrieved successfully',
		meta: result.meta,
		data: result.data,
	})
})

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
	const result = await CategoryService.getCategoryById(
		String(req.params.id),
	)

	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Category retrieved successfully',
		data: result,
	})
})

const updateCategory = catchAsync(async (req: Request, res) => {
	const result = await CategoryService.updateCategory(
		String(req.params.id),
		req,
	)

	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Category updated successfully',
		data: result,
	})
})


const deleteCategory = catchAsync(async (req: Request, res: Response) => {
	await CategoryService.deleteCategory(String(req.params.id))

	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Category deleted successfully',
		data: null,
	})
})



export const CategoryController = {
	createCategory,
	getCategories,
	getCategoryById,
	updateCategory,
	deleteCategory,
}