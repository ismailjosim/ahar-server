import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import { calculatePagination } from '@/utils/paginationHelper'
import StatusCode from '@/utils/statusCode'

import { fromDbOrderStatus, toDbOrderStatus } from './orders.utils'

type OrderPayload = Record<string, unknown>

const toClient = (
	order: Awaited<ReturnType<typeof prisma.order.findFirst>>,
) => {
	if (!order) return null
	return {
		id: order.id,
		customer: order.customerName,
		phone: order.phone,
		items: order.itemSummary,
		method: order.paymentMethod,
		total: order.total,
		status: fromDbOrderStatus(order.status),
		type: order.fulfillmentType,
	}
}

const getOrders = async (query: Record<string, unknown>) => {
	const { page, limit, skip } = calculatePagination({
		page: Number(query.page || 1),
		limit: Number(query.limit || query.pageSize || 10),
	})
	const search = typeof query.search === 'string' ? query.search : undefined
	const status =
		typeof query.status === 'string' && query.status
			? toDbOrderStatus(query.status)
			: undefined

	const where = {
		...(status && { status }),
		...(search && {
			OR: [
				{ id: { contains: search, mode: 'insensitive' as const } },
				{
					customerName: {
						contains: search,
						mode: 'insensitive' as const,
					},
				},
				{
					itemSummary: {
						contains: search,
						mode: 'insensitive' as const,
					},
				},
			],
		}),
	}

	const [data, total] = await Promise.all([
		prisma.order.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.order.count({ where }),
	])

	return { data: data.map(toClient), total, page, limit }
}

const getOrderById = async (id: string) => {
	const order = await prisma.order.findUnique({ where: { id } })
	if (!order) throw new AppError(StatusCode.NOT_FOUND, 'Order not found')
	return toClient(order)
}

const createOrder = async (payload: OrderPayload) => {
	const order = await prisma.order.create({
		data: {
			customerName: String(
				payload.customer || payload.customerName || 'Guest',
			),
			phone: String(payload.phone || ''),
			email: payload.email ? String(payload.email) : undefined,
			fulfillmentType: String(
				payload.type || payload.fulfillmentType || 'Delivery',
			),
			itemSummary: String(payload.items || payload.itemSummary || ''),
			address: payload.address ? String(payload.address) : undefined,
			notes: payload.notes ? String(payload.notes) : undefined,
			subtotal: Number(payload.subtotal || payload.total || 0),
			deliveryFee: Number(payload.deliveryFee || 0),
			vat: Number(payload.vat || 0),
			serviceCharge: Number(payload.serviceCharge || 0),
			discount: Number(payload.discount || 0),
			total: Number(payload.total || 0),
			paymentMethod: String(
				payload.method || payload.paymentMethod || 'COD',
			),
			status: toDbOrderStatus(String(payload.status || 'Placed')),
		},
	})

	return toClient(order)
}

const updateOrderStatus = async (id: string, status: string) => {
	await getOrderById(id)
	const order = await prisma.order.update({
		where: { id },
		data: { status: toDbOrderStatus(status) },
	})
	return toClient(order)
}

export const OrdersService = {
	getOrders,
	getOrderById,
	createOrder,
	updateOrderStatus,
}
