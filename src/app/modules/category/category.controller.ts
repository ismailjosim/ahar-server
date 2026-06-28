import { Request, Response } from 'express'
import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

const createCategory = catchAsync(async (req: Request, res: Response) => {
	console.log(req.body)
	sendResponse(res, {
		statusCode: StatusCode.CREATED,
		success: true,
		message: 'Category created successfully',
		data: null,
	})
})

export const CategoryController = {
	createCategory,
}
