import { prisma } from '@/config/prisma.config'

import { OrderStatus, ReservationStatus } from '../../../generated/prisma/enums'
import { fromDbOrderStatus } from '../orders/orders.utils'

// Status helper for reservations
const fromReservationStatus = (status: ReservationStatus): string => {
	switch (status) {
		case ReservationStatus.APPROVED:
			return 'Approved'
		case ReservationStatus.REJECTED:
			return 'Rejected'
		case ReservationStatus.CANCELLED:
			return 'Cancelled'
		default:
			return 'Pending'
	}
}

const escapeCsv = (value: unknown) => {
	const text = String(value ?? '')
	return `"${text.replace(/"/g, '""')}"`
}

const exportCsv = async (type: string, from?: string, to?: string) => {
	// Build date filter if provided
	let dateFilter: Record<string, unknown> = {}
	if (from || to) {
		dateFilter = {
			createdAt: {
				...(from && { gte: new Date(from) }),
				...(to && { lte: new Date(to) }),
			},
		}
	}

	if (type === 'inventory') {
		const items = await prisma.inventoryItem.findMany({
			orderBy: { createdAt: 'desc' },
		})
		return [
			[
				'ID',
				'Name',
				'Category',
				'SKU',
				'Stock',
				'Unit',
				'Threshold',
			].join(','),
			...items.map((item) =>
				[
					item.id,
					item.name,
					item.category,
					item.sku || '',
					item.stock,
					item.unit,
					item.threshold,
				]
					.map(escapeCsv)
					.join(','),
			),
		].join('\n')
	}

	if (type === 'reservations') {
		const reservations = await prisma.reservation.findMany({
			where: dateFilter,
			orderBy: { createdAt: 'desc' },
		})
		return [
			[
				'ID',
				'Customer',
				'Phone',
				'Guests',
				'Time',
				'Table',
				'Status',
			].join(','),
			...reservations.map((reservation) =>
				[
					reservation.id,
					reservation.customerName,
					reservation.phone,
					reservation.guests,
					reservation.displayTime ||
						reservation.reservationTime.toISOString(),
					reservation.tableCode || '',
					reservation.status,
				]
					.map(escapeCsv)
					.join(','),
			),
		].join('\n')
	}

	const orders = await prisma.order.findMany({
		where: dateFilter,
		orderBy: { createdAt: 'desc' },
	})
	return [
		['ID', 'Customer', 'Phone', 'Items', 'Payment', 'Total', 'Status'].join(
			',',
		),
		...orders.map((order) =>
			[
				order.id,
				order.customerName,
				order.phone,
				order.itemSummary,
				order.paymentMethod,
				order.total,
				order.status,
			]
				.map(escapeCsv)
				.join(','),
		),
	].join('\n')
}

// ── Dashboard Stats ────────────────────────────────────────────────────────────

async function getDashboardStats() {
	const now = new Date()
	const todayStart = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	)
	const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

	const [
		totalOrdersToday,
		totalRevenueToday,
		pendingOrders,
		totalReservationsToday,
		activeMenuItems,
		lowStockCount,
		recentOrders,
		upcomingReservations,
	] = await prisma.$transaction([
		prisma.order.count({ where: { createdAt: { gte: todayStart } } }),

		prisma.order.aggregate({
			_sum: { total: true },
			where: {
				createdAt: { gte: todayStart },
				status: 'DELIVERED',
			},
		}),

		prisma.order.count({
			where: {
				status: { in: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'] },
			},
		}),

		prisma.reservation.count({
			where: {
				reservationTime: { gte: todayStart },
				status: { in: ['PENDING', 'APPROVED'] },
			},
		}),

		prisma.menuItem.count({ where: { isAvailable: true } }),

		// Low stock: fetch all and count in JS (Prisma field-to-field limitation)
		prisma.inventoryItem.findMany({
			where: { stock: { lte: prisma.raw('threshold') } },
		}),

		prisma.order.findMany({
			orderBy: { createdAt: 'desc' },
			take: 5,
			select: {
				id: true,
				customerName: true,
				phone: true,
				itemSummary: true,
				paymentMethod: true,
				total: true,
				status: true,
				fulfillmentType: true,
				createdAt: true,
			},
		}),

		prisma.reservation.findMany({
			where: {
				reservationTime: { gte: now },
				status: { in: ['PENDING', 'APPROVED'] },
			},
			orderBy: { reservationTime: 'asc' },
			take: 5,
			select: {
				id: true,
				customerName: true,
				phone: true,
				guests: true,
				displayTime: true,
				tableCode: true,
				status: true,
			},
		}),
	])

	const inventoryItems = lowStockCount as Array<{
		stock: number
		threshold: number
	}>
	const lowStockItems = inventoryItems.filter(
		(i) => i.stock <= i.threshold,
	).length

	// Weekly revenue — aggregate by day
	const weeklyRevenue = await prisma.order.groupBy({
		by: ['createdAt'],
		_sum: { total: true },
		where: { createdAt: { gte: weekStart }, status: 'DELIVERED' },
	})

	return {
		stats: {
			totalOrdersToday,
			totalRevenueToday: totalRevenueToday._sum.total ?? 0,
			pendingOrders,
			totalReservationsToday,
			activeMenuItems,
			lowStockCount: lowStockItems,
		},
		recentOrders: recentOrders.map((o) => ({
			id: o.id,
			customer: o.customerName,
			phone: o.phone,
			items: o.itemSummary,
			method: o.paymentMethod,
			total: o.total,
			status: fromDbOrderStatus(o.status as OrderStatus),
			type: o.fulfillmentType,
		})),
		upcomingReservations: upcomingReservations.map((r) => ({
			id: r.id,
			customer: r.customerName,
			phone: r.phone,
			guests: r.guests,
			time: r.displayTime,
			table: r.tableCode ?? 'Any',
			status: fromReservationStatus(r.status as ReservationStatus),
		})),
		weeklyRevenue,
	}
}

// ── Summary Stats with Date Range ─────────────────────────────────────────────

async function getSummaryStats(from?: string, to?: string) {
	const now = new Date()
	const fromDate = from
		? new Date(from)
		: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
	const toDate = to ? new Date(to) : new Date()

	const dateFilter = { createdAt: { gte: fromDate, lte: toDate } }

	const [
		totalRevenue,
		totalOrders,
		avgOrderValue,
		topItems,
		ordersByStatus,
		paymentsByMethod,
	] = await prisma.$transaction([
		// Total revenue (delivered orders only)
		prisma.order.aggregate({
			_sum: { total: true },
			where: { ...dateFilter, status: 'DELIVERED' },
		}),

		// Total orders
		prisma.order.count({ where: dateFilter }),

		// Average order value
		prisma.order.aggregate({
			_avg: { total: true },
			where: { ...dateFilter, status: 'DELIVERED' },
		}),

		// Top 5 best-selling items by quantity
		prisma.orderItem.groupBy({
			by: ['nameSnapshot'],
			_sum: { quantity: true, lineTotal: true },
			where: { order: { ...dateFilter, status: 'DELIVERED' } },
			orderBy: { _sum: { quantity: 'desc' } },
			take: 5,
		}),

		// Orders grouped by status
		prisma.order.groupBy({
			by: ['status'],
			_count: { id: true },
			where: dateFilter,
		}),

		// Payments grouped by method
		prisma.payment.groupBy({
			by: ['method'],
			_sum: { amount: true },
			_count: { id: true },
			where: dateFilter,
		}),
	])

	return {
		revenue: totalRevenue._sum.total ?? 0,
		totalOrders,
		avgOrderValue: avgOrderValue._avg.total ?? 0,
		topItems: topItems.map((i) => ({
			name: i.nameSnapshot,
			quantity: i._sum.quantity ?? 0,
			revenue: i._sum.lineTotal ?? 0,
		})),
		ordersByStatus: ordersByStatus.map((o) => ({
			status: fromDbOrderStatus(o.status as OrderStatus),
			count: o._count.id,
		})),
		paymentsByMethod: paymentsByMethod.map((p) => ({
			method: p.method,
			count: p._count.id,
			total: p._sum.amount ?? 0,
		})),
		fromDate: fromDate.toISOString(),
		toDate: toDate.toISOString(),
	}
}

export const ReportsService = {
	exportCsv,
	getDashboardStats,
	getSummaryStats,
}
