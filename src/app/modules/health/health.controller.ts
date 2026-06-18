import catchAsync from '@/shared/catchAsync'
import sendResponse from '@/shared/sendResponse'
import StatusCode from '@/utils/statusCode'
import { envVars } from '@/config/env'

const getHealth = catchAsync(async (req, res) => {
	sendResponse(res, {
		statusCode: StatusCode.OK,
		success: true,
		message: 'Ahar server is healthy',
		data: {
			environment: envVars.NODE_ENV,
			uptime: `${process.uptime().toFixed(2)} sec`,
			timeStamp: new Date().toISOString(),
		},
	})
})

export const HealthController = {
	getHealth,
}
