import { z } from 'zod'

const inventoryItemBody = z.object({
	name: z.string().min(1).max(120),
	category: z.string().min(1),
	sku: z.string().optional(),
	stock: z.number().min(0),
	unit: z.string().min(1),
	threshold: z.number().min(0),
	supplier: z.string().optional(),
	unitCost: z.number().min(0),
	lastRestocked: z.string().datetime().optional(),
})

const createInventoryItem = z.object({
	body: inventoryItemBody,
})

const updateInventoryItem = z.object({
	params: z.object({ id: z.string().min(1) }),
	body: inventoryItemBody.partial(),
})

const getInventoryItems = z.object({
	query: z.object({
		page: z.string().optional(),
		limit: z.string().optional(),
		pageSize: z.string().optional(),
		lowStockOnly: z.enum(['true', 'false']).optional(),
	}),
})

export const InventoryValidation = {
	createInventoryItem,
	updateInventoryItem,
	getInventoryItems,
}
