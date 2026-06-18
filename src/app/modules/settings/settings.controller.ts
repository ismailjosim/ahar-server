import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'

import { SettingsService } from './settings.service'

const getSettings = catchAsync(async (req, res) => {
	const result = await SettingsService.getSettings()
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Settings retrieved successfully',
		data: result,
	})
})

const updateSettings = catchAsync(async (req, res) => {
	const result = await SettingsService.updateSettings(req.body)
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Settings updated successfully',
		data: result,
	})
})

export const SettingsController = {
	getSettings,
	updateSettings,
}
