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
	const [data, total] = await Promise.all([
		prisma.inventoryItem.findMany({
			skip,
			take: limit,
			include: { audits: { orderBy: { createdAt: 'desc' } } },
			orderBy: { createdAt: 'desc' },
		}),
		prisma.inventoryItem.count(),
	])
	return { data: data.map(toClient), total, page, limit }
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
	return toClient(item)
}

const deleteInventoryItem = async (id: string) => {
	await getInventoryItemById(id)
	await prisma.inventoryItem.delete({ where: { id } })
	return null
}

export const InventoryService = {
	getInventoryItems,
	getInventoryItemById,
	createInventoryItem,
	updateInventoryItem,
	deleteInventoryItem,
}
