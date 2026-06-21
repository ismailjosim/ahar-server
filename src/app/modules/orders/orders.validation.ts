import { z } from 'zod'

const BD_PHONE_REGEX = /^(?:\+?880|0)?1[3-9]\d{8}$/

const orderItemBody = z.object({
	menuItemId: z.string().optional(),
	nameSnapshot: z.string().min(1),
	quantity: z.number().int().positive(),
	unitPrice: z.number().positive(),
	selectedVariant: z.record(z.string(), z.unknown()).optional(),
	selectedAddOns: z.array(z.unknown()).optional(),
	lineTotal: z.number().positive(),
})

const createOrder = z.object({
	body: z.object({
		customerName: z.string().min(1).max(120),
		phone: z.string().regex(BD_PHONE_REGEX, 'Invalid BD phone number'),
		email: z.string().email().optional(),
		fulfillmentType: z.enum(['delivery', 'pickup']),
		items: z
			.array(orderItemBody)
			.min(1, 'Order must have at least one item'),
		address: z.string().min(5).optional(),
		notes: z.string().max(500).optional(),
		paymentMethod: z.enum(['cod', 'sslcommerz', 'bkash', 'nagad']),
		couponCode: z.string().optional(),
	}),
})

const updateOrderStatus = z.object({
	params: z.object({ id: z.string().min(1) }),
	body: z.object({
		status: z.enum([
			'Placed',
			'Accepted',
			'Preparing',
			'Ready',
			'Out for Delivery',
			'Delivered',
			'Cancelled',
		]),
	}),
})

export const OrdersValidation = {
	createOrder,
	updateOrderStatus,
}
