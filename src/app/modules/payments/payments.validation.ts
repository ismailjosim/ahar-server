import { z } from 'zod'

const createPayment = z.object({
	body: z.object({
		orderId: z.string().optional(),
		provider: z.string().min(1),
		method: z.enum(['cod', 'sslcommerz', 'bkash', 'nagad', 'card']),
		amount: z.number().positive(),
		status: z
			.enum(['Pending', 'Completed', 'Failed', 'Refunded'])
			.optional(),
		providerTransactionId: z.string().optional(),
	}),
})

const updatePayment = z.object({
	params: z.object({ id: z.string().min(1) }),
	body: z.object({
		status: z
			.enum(['Pending', 'Completed', 'Failed', 'Refunded'])
			.optional(),
		providerTransactionId: z.string().optional(),
		refundReason: z.string().max(300).optional(),
	}),
})

export const PaymentsValidation = {
	createPayment,
	updatePayment,
}
