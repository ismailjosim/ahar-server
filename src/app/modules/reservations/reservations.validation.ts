import { z } from 'zod'

const BD_PHONE_REGEX = /^(?:\+?880|0)?1[3-9]\d{8}$/

const createReservation = z.object({
	body: z.object({
		customerName: z.string().min(1).max(120),
		phone: z.string().regex(BD_PHONE_REGEX, 'Invalid BD phone number'),
		guests: z.number().int().min(1).max(20),
		displayTime: z.string().min(1),
		tableCode: z.string().optional(),
		occasion: z.string().max(100).optional(),
		notes: z.string().max(500).optional(),
	}),
})

const updateReservation = z.object({
	params: z.object({ id: z.string().min(1) }),
	body: z.object({
		status: z
			.enum(['Pending', 'Approved', 'Rejected', 'Cancelled'])
			.optional(),
		displayTime: z.string().optional(),
		tableCode: z.string().optional(),
		notes: z.string().max(500).optional(),
	}),
})

export const ReservationsValidation = {
	createReservation,
	updateReservation,
}
