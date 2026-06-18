import { z } from 'zod'

const optionalString = z.string().trim().optional()
const nonEmptyString = z.string().trim().min(1)
const money = z.coerce.number().min(0)

const menuSchema = z.object({
	id: optionalString,
	name: nonEmptyString,
	description: optionalString.default(''),
	category: nonEmptyString.default('All Dishes'),
	price: money,
	emoji: optionalString.default('🍽'),
	rating: z.coerce.number().min(0).max(5).optional().default(4.5),
	prepTime: optionalString.default('25 min'),
	tags: z.array(z.string()).optional().default([]),
	variants: z.array(z.record(z.string(), z.unknown())).optional().default([]),
	addOns: z.array(z.record(z.string(), z.unknown())).optional().default([]),
	isFeatured: z.coerce.boolean().optional().default(false),
	isSpicy: z.coerce.boolean().optional().default(false),
	isAvailable: z.coerce.boolean().optional().default(true),
})

const reservationSchema = z.object({
	id: optionalString,
	customer: nonEmptyString,
	phone: nonEmptyString,
	guests: z.coerce.number().int().positive(),
	time: nonEmptyString,
	table: optionalString.default('T-01'),
	status: z.enum(['Pending', 'Approved', 'Rejected', 'Cancelled']).optional().default('Pending'),
	notes: optionalString,
})

const inventorySchema = z.object({
	id: optionalString,
	name: nonEmptyString,
	category: nonEmptyString.default('Kitchen'),
	sku: optionalString.default(''),
	stock: z.coerce.number().min(0).default(0),
	unit: nonEmptyString.default('pcs'),
	threshold: z.coerce.number().min(0).default(10),
	supplier: optionalString.default(''),
	unitCost: money.default(0),
	lastRestocked: optionalString,
	history: z.array(z.string()).optional().default([]),
})

const settingsSchema = z.record(z.string(), z.unknown()).and(
	z.object({
		id: z.string().optional().default('default'),
	}),
)

const orderSchema = z.record(z.string(), z.unknown()).and(
	z.object({
		id: optionalString,
		customer: optionalString,
		phone: optionalString,
		status: optionalString,
		total: z.coerce.number().min(0).optional(),
	}),
)

const paymentSchema = z.record(z.string(), z.unknown()).and(
	z.object({
		id: optionalString,
		orderId: optionalString,
		method: optionalString,
		amount: z.coerce.number().min(0).optional(),
		status: optionalString,
	}),
)

const notificationSchema = z.record(z.string(), z.unknown()).and(
	z.object({
		id: optionalString,
		type: optionalString,
		message: optionalString,
		read: z.coerce.boolean().optional(),
	}),
)

const schemas = {
	menu: menuSchema,
	orders: orderSchema,
	reservations: reservationSchema,
	payments: paymentSchema,
	inventory: inventorySchema,
	settings: settingsSchema,
	notifications: notificationSchema,
}

export function getCreateSchema(collection) {
	return schemas[collection] || z.record(z.string(), z.unknown())
}

export function getUpdateSchema(collection) {
	const schema = getCreateSchema(collection)
	return typeof schema.partial === 'function' ? schema.partial() : schema
}
