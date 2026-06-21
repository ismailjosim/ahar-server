import { z } from 'zod'

const createNotification = z.object({
	body: z.object({
		type: z.string().min(1),
		severity: z.enum(['info', 'warning', 'critical', 'success']),
		title: z.string().min(1).max(200),
		message: z.string().min(1).max(1000),
		sourceType: z.string().optional(),
		sourceId: z.string().optional(),
	}),
})

export const NotificationsValidation = {
	createNotification,
}
