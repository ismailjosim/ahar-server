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

const getPublicSettings = catchAsync(async (req, res) => {
	const settings = await SettingsService.getSettings()
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Public settings retrieved successfully',
		data: {
			restaurantName: settings.restaurantName,
			supportPhone: settings.supportPhone,
			address: settings.address,
			openingTime: settings.openingTime,
			closingTime: settings.closingTime,
			deliveryFee: settings.deliveryFee,
			freeDeliveryMin: settings.freeDeliveryMin,
			vatRate: settings.vatRate,
			serviceChargeRate: settings.serviceChargeRate,
			acceptCod: settings.acceptCod,
			acceptBkash: settings.acceptBkash,
			acceptNagad: settings.acceptNagad,
			acceptSslcommerz: settings.acceptSslcommerz,
			maxTablesPerSlot: settings.maxTablesPerSlot,
		},
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
	getPublicSettings,
	updateSettings,
}
