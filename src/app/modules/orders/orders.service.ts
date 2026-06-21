import { prisma } from '@/config/prisma.config'
import AppError from '@/helpers/AppError'
import { calculatePagination } from '@/utils/paginationHelper'
import StatusCode from '@/utils/statusCode'

import { OrderStatus, PaymentStatus } from '../../../generated/prisma/enums'
import type { OrderItemUncheckedCreateWithoutOrderInput } from '../../../generated/prisma/models/OrderItem'
import {
	fromDbOrderStatus,
	fromDbPaymentStatus,
	toDbOrderStatus,
} from './orders.utils'

interface CreateOrderItemInput {
	menuItemId?: string
	nameSnapshot: string
	quantity: number
	unitPrice: number
	selectedVariant?: Record<string, unknown>
	selectedAddOns?: unknown[]
	lineTotal: number
}

interface CreateOrderPayload {
	customerName: string
	phone: string
	email?: string
	fulfillmentType: 'delivery' | 'pickup'
	items: CreateOrderItemInput[]
	address?: string
	notes?: string
	paymentMethod: string
	couponCode?: string
	userId?: string
}

interface OrderItemRecord {
	nameSnapshot: string
	quantity: number
	unitPrice: number
	lineTotal: number
	selectedVariant: unknown
	selectedAddOns: unknown
}

interface OrderRecord {
	id: string
	customerName: string
	phone: string
	email: string | null
	fulfillmentType: string
	itemSummary: string
	address: string | null
	notes: string | null
	subtotal: number
	deliveryFee: number
	vat: number
	serviceCharge: number
	discount: number
	total: number
	paymentMethod: string
	paymentStatus: PaymentStatus
	status: OrderStatus
	createdAt: Date
	items?: OrderItemRecord[]
}

const capitalize = (value: string) =>
	value ? value.charAt(0).toUpperCase() + value.slice(1) : value

const toClient = (order: OrderRecord | null) => {
	if (!order) return null
	return {
		id: order.id,
		customer: order.customerName,
		phone: order.phone,
		email: order.email,
		fulfillmentType: order.fulfillmentType,
		// `items` stays a summary string for backward-compatible list/table views.
		items: order.itemSummary,
		itemSummary: order.itemSummary,
		// `lineItems` carries the structured breakdown for the tracking page.
		lineItems: (order.items ?? []).map((item) => ({
			name: item.nameSnapshot,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			lineTotal: item.lineTotal,
			variant: item.selectedVariant ?? null,
			addOns: item.selectedAddOns ?? null,
		})),
		address: order.address,
		notes: order.notes,
		subtotal: order.subtotal,
		deliveryFee: order.deliveryFee,
		vat: order.vat,
		serviceCharge: order.serviceCharge,
		discount: order.discount,
		total: order.total,
		method: order.paymentMethod,
		paymentMethod: order.paymentMethod,
		paymentStatus: fromDbPaymentStatus(order.paymentStatus),
		status: fromDbOrderStatus(order.status),
		type: capitalize(order.fulfillmentType),
		createdAt: order.createdAt,
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
			include: { items: true },
		}),
		prisma.order.count({ where }),
	])

	return { data: data.map(toClient), total, page, limit }
}

const getOrderById = async (id: string) => {
	const order = await prisma.order.findUnique({
		where: { id },
		include: { items: true },
	})
	if (!order) throw new AppError(StatusCode.NOT_FOUND, 'Order not found')
	return toClient(order)
}

const createOrder = async (payload: CreateOrderPayload) => {
	const settings = await prisma.restaurantSettings.findFirst({
		where: { id: 'default' },
	})
	const deliveryFee =
		payload.fulfillmentType === 'delivery'
			? (settings?.deliveryFee ?? 80)
			: 0
	const vatRate = settings?.vatRate ?? 0.05
	const serviceChargeRate = settings?.serviceChargeRate ?? 0.1

	const jsonInput = (value: unknown) =>
		value as OrderItemUncheckedCreateWithoutOrderInput['selectedVariant']

	// Validate and price each item from the DB — client prices are never trusted.
	const items: OrderItemUncheckedCreateWithoutOrderInput[] =
		await Promise.all(
			payload.items.map(async (item) => {
				if (!item.menuItemId) {
					// Custom items without a menuItemId fall back to the client price.
					return {
						menuItemId: null,
						nameSnapshot: item.nameSnapshot,
						quantity: item.quantity,
						unitPrice: item.unitPrice,
						selectedVariant: jsonInput(
							item.selectedVariant ?? undefined,
						),
						selectedAddOns: jsonInput(
							item.selectedAddOns ?? undefined,
						),
						lineTotal: item.unitPrice * item.quantity,
					}
				}

				const dbItem = await prisma.menuItem.findUnique({
					where: { id: item.menuItemId },
				})
				if (!dbItem || !dbItem.isAvailable) {
					throw new AppError(
						StatusCode.BAD_REQUEST,
						`Item "${item.nameSnapshot}" is not available.`,
					)
				}

				const unitPrice = dbItem.price
				const lineTotal = unitPrice * item.quantity
				return {
					menuItemId: item.menuItemId,
					nameSnapshot: dbItem.name,
					quantity: item.quantity,
					unitPrice,
					selectedVariant: jsonInput(
						item.selectedVariant ?? undefined,
					),
					selectedAddOns: jsonInput(item.selectedAddOns ?? undefined),
					lineTotal,
				}
			}),
		)

	const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)

	// Validate and apply the coupon, if one was supplied.
	let discount = 0
	if (payload.couponCode) {
		const coupon = await prisma.coupon.findFirst({
			where: { code: payload.couponCode, isActive: true },
		})
		if (coupon) {
			if (coupon.expiresAt && coupon.expiresAt < new Date()) {
				throw new AppError(
					StatusCode.BAD_REQUEST,
					'This coupon has expired.',
				)
			}
			if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
				throw new AppError(
					StatusCode.BAD_REQUEST,
					'Coupon usage limit reached.',
				)
			}
			if (subtotal < coupon.minOrderValue) {
				throw new AppError(
					StatusCode.BAD_REQUEST,
					`Minimum order for this coupon is ৳${coupon.minOrderValue}.`,
				)
			}
			discount =
				coupon.discountType === 'percent'
					? subtotal * (coupon.discountValue / 100)
					: coupon.discountValue
			discount = Math.min(discount, subtotal)
			await prisma.coupon.update({
				where: { id: coupon.id },
				data: { usedCount: { increment: 1 } },
			})
		}
	}

	const taxable = subtotal - discount
	const vat = taxable * vatRate
	const serviceCharge = taxable * serviceChargeRate
	const total = taxable + vat + serviceCharge + deliveryFee

	const itemSummary = items
		.map((i) => `${i.nameSnapshot} x${i.quantity}`)
		.join(', ')

	const order = await prisma.order.create({
		data: {
			customerName: payload.customerName,
			phone: payload.phone,
			email: payload.email,
			fulfillmentType: payload.fulfillmentType,
			itemSummary,
			address: payload.address,
			notes: payload.notes,
			subtotal,
			deliveryFee,
			vat,
			serviceCharge,
			discount,
			total,
			paymentMethod: payload.paymentMethod,
			userId: payload.userId ?? null,
			items: { create: items },
		},
		include: { items: true },
	})

	return toClient(order)
}

const VALID_TRANSITIONS: Record<string, string[]> = {
	Placed: ['Accepted', 'Cancelled'],
	Accepted: ['Preparing', 'Cancelled'],
	Preparing: ['Ready'],
	Ready: ['Out for Delivery', 'Delivered'],
	'Out for Delivery': ['Delivered'],
	Delivered: [],
	Cancelled: [],
}

const updateOrderStatus = async (id: string, status: string) => {
	const order = await prisma.order.findUnique({ where: { id } })
	if (!order) throw new AppError(StatusCode.NOT_FOUND, 'Order not found')

	const current = fromDbOrderStatus(order.status)
	const allowed = VALID_TRANSITIONS[current] ?? []
	if (!allowed.includes(status)) {
		throw new AppError(
			StatusCode.BAD_REQUEST,
			`Cannot transition from "${current}" to "${status}".`,
		)
	}

	const updated = await prisma.order.update({
		where: { id },
		data: { status: toDbOrderStatus(status) },
		include: { items: true },
	})
	return toClient(updated)
}

export const OrdersService = {
	getOrders,
	getOrderById,
	createOrder,
	updateOrderStatus,
}
