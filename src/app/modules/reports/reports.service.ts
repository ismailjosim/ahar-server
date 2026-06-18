import { prisma } from '@/config/prisma.config'

const escapeCsv = (value: unknown) => {
	const text = String(value ?? '')
	return `"${text.replace(/"/g, '""')}"`
}

const exportCsv = async (type: string) => {
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

export const ReportsService = {
	exportCsv,
}
