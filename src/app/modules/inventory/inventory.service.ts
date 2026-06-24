import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import { calculatePagination } from '@/utils/paginationHelper'
import StatusCode from '@/utils/statusCode'

type InventoryPayload = Record<string, unknown>
type InventoryItemWithAudits = Awaited<
	ReturnType<typeof prisma.inventoryItem.findFirst>
> & {
	audits?: {
		nextStock: number
		reason: string | null
	}[]
}

const toClient = (item: InventoryItemWithAudits) => {
	if (!item) return null
	return {
		id: item.id,
		name: item.name,
		category: item.category,
		sku: item.sku || '',
		stock: item.stock,
		unit: item.unit,
		threshold: item.threshold,
		supplier: item.supplier || '',
		unitCost: item.unitCost,
		lastRestocked: item.lastRestocked?.toISOString().slice(0, 10) || '',
		history: item.audits?.length
			? item.audits.map(
					(audit) =>
						audit.reason || `Stock changed to ${audit.nextStock}`,
				)
			: ['Item loaded'],
	}
}

const getInventoryItems = async (query: Record<string, unknown>) => {
	const { page, limit, skip } = calculatePagination({
		page: Number(query.page || 1),
		limit: Number(query.limit || query.pageSize || 100),
	})

	const lowStockOnly =
		query.lowStockOnly === 'true' || query.lowStockOnly === true

	const [data, total] = await Promise.all([
		prisma.inventoryItem.findMany({
			skip,
			take: limit,
			include: { audits: { orderBy: { createdAt: 'desc' } } },
			orderBy: { createdAt: 'desc' },
		}),
		prisma.inventoryItem.count(),
	])

	let filteredData = data.map(toClient)
	if (lowStockOnly) {
		filteredData = filteredData.filter(
			(item) => item && item.stock <= item.threshold,
		)
	}

	return { data: filteredData, total, page, limit }
}

const getInventoryItemById = async (id: string) => {
	const item = await prisma.inventoryItem.findUnique({
		where: { id },
		include: { audits: { orderBy: { createdAt: 'desc' } } },
	})
	if (!item)
		throw new AppError(StatusCode.NOT_FOUND, 'Inventory item not found')
	return toClient(item)
}

const createInventoryItem = async (payload: InventoryPayload) => {
	const stock = Number(payload.stock || 0)
	const item = await prisma.inventoryItem.create({
		data: {
			name: String(payload.name || 'New Inventory Item'),
			category: String(payload.category || 'Kitchen'),
			sku: payload.sku ? String(payload.sku) : undefined,
			stock,
			unit: String(payload.unit || 'pcs'),
			threshold: Number(payload.threshold || 10),
			supplier: payload.supplier ? String(payload.supplier) : undefined,
			unitCost: Number(payload.unitCost || 0),
			lastRestocked: payload.lastRestocked
				? new Date(String(payload.lastRestocked))
				: new Date(),
			audits: {
				create: {
					change: stock,
					previousStock: 0,
					nextStock: stock,
					reason: 'Item created',
				},
			},
		},
		include: { audits: { orderBy: { createdAt: 'desc' } } },
	})
	return toClient(item)
}

const updateInventoryItem = async (id: string, payload: InventoryPayload) => {
	const current = await prisma.inventoryItem.findUnique({ where: { id } })
	if (!current)
		throw new AppError(StatusCode.NOT_FOUND, 'Inventory item not found')

	const nextStock =
		payload.stock === undefined ? current.stock : Number(payload.stock)

	// Prevent negative stock
	if (nextStock < 0) {
		throw new AppError(StatusCode.BAD_REQUEST, 'Stock cannot be negative.')
	}

	const item = await prisma.inventoryItem.update({
		where: { id },
		data: {
			...(payload.name !== undefined && { name: String(payload.name) }),
			...(payload.category !== undefined && {
				category: String(payload.category),
			}),
			...(payload.sku !== undefined && { sku: String(payload.sku) }),
			stock: nextStock,
			...(payload.unit !== undefined && { unit: String(payload.unit) }),
			...(payload.threshold !== undefined && {
				threshold: Number(payload.threshold),
			}),
			...(payload.supplier !== undefined && {
				supplier: String(payload.supplier),
			}),
			...(payload.unitCost !== undefined && {
				unitCost: Number(payload.unitCost),
			}),
			...(payload.lastRestocked !== undefined && {
				lastRestocked: new Date(String(payload.lastRestocked)),
			}),
			audits: {
				create: {
					change: nextStock - current.stock,
					previousStock: current.stock,
					nextStock,
					reason:
						payload.stock !== undefined
							? `Stock changed to ${nextStock} ${current.unit}`
							: 'Item details updated',
				},
			},
		},
		include: { audits: { orderBy: { createdAt: 'desc' } } },
	})

	// Trigger low-stock notification if threshold crossed
	if (nextStock <= item.threshold && current.stock > item.threshold) {
		await createLowStockNotification(item)
	}

	return toClient(item)
}

const deleteInventoryItem = async (id: string) => {
	await getInventoryItemById(id)
	await prisma.inventoryItem.delete({ where: { id } })
	return null
}

const createLowStockNotification = async (item: {
	id: string
	name: string
	stock: number
	threshold: number
}) => {
	const severity = item.stock === 0 ? 'critical' : 'warning'
	await prisma.notification.create({
		data: {
			type: 'low_stock',
			severity,
			title: `Low stock: ${item.name}`,
			message: `${item.name} has ${item.stock} ${item.stock === 1 ? 'unit' : 'units'} remaining (threshold: ${item.threshold}).`,
			sourceType: 'inventory',
			sourceId: item.id,
		},
	})
}

interface OrderItemForInventory {
	nameSnapshot: string
	quantity: number
}

const adjustStockForOrder = async (items: OrderItemForInventory[]) => {
	for (const item of items) {
		// Simple name-based lookup — case insensitive, partial match
		const invItem = await prisma.inventoryItem.findFirst({
			where: {
				name: {
					contains: item.nameSnapshot.split(' ')[0],
					mode: 'insensitive',
				},
			},
		})

		if (!invItem) continue // no matching inventory item — skip silently

		const newStock = Math.max(0, invItem.stock - item.quantity)

		await prisma.inventoryItem.update({
			where: { id: invItem.id },
			data: { stock: newStock },
		})

		await prisma.inventoryAudit.create({
			data: {
				inventoryItemId: invItem.id,
				change: -item.quantity,
				previousStock: invItem.stock,
				nextStock: newStock,
				reason: `Auto-deducted: order item "${item.nameSnapshot}"`,
			},
		})

		if (newStock <= invItem.threshold) {
			await createLowStockNotification({
				...invItem,
				stock: newStock,
			})
		}
	}
}

export const InventoryService = {
	getInventoryItems,
	getInventoryItemById,
	createInventoryItem,
	updateInventoryItem,
	deleteInventoryItem,
	adjustStockForOrder,
}
