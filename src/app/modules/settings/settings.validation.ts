import { z } from 'zod'

// vatRate and serviceChargeRate are stored as whole-number percentages (e.g. 5 = 5%, 10 = 10%).
const updateSettings = z.object({
	body: z.object({
		restaurantName: z.string().min(1).max(120).optional(),
		supportPhone: z.string().optional(),
		supportEmail: z.string().email().optional(),
		address: z.string().max(300).optional(),
		openingTime: z.string().optional(),
		closingTime: z.string().optional(),
		deliveryFee: z.number().min(0).optional(),
		freeDeliveryMin: z.number().min(0).optional(),
		vatRate: z.number().min(0).max(100).optional(),
		serviceChargeRate: z.number().min(0).max(100).optional(),
		acceptCod: z.boolean().optional(),
		acceptBkash: z.boolean().optional(),
		acceptNagad: z.boolean().optional(),
		acceptSslcommerz: z.boolean().optional(),
		lowStockAlerts: z.boolean().optional(),
		reservationAlerts: z.boolean().optional(),
		paymentAlerts: z.boolean().optional(),
	}),
})

export const SettingsValidation = {
	updateSettings,
}
