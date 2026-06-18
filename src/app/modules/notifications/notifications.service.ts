import { prisma } from '@/config/prisma.config'
import { calculatePagination } from '@/utils/paginationHelper'

type NotificationPayload = Record<string, unknown>

const getNotifications = async (query: Record<string, unknown>) => {
	const { page, limit, skip } = calculatePagination({
		page: Number(query.page || 1),
		limit: Number(query.limit || query.pageSize || 20),
	})
	const [data, total] = await Promise.all([
		prisma.notification.findMany({
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
		}),
		prisma.notification.count(),
	])
	return { data, total, page, limit }
}

const createNotification = async (payload: NotificationPayload) => {
	return prisma.notification.create({
		data: {
			type: String(payload.type || 'info'),
			severity: String(payload.severity || payload.type || 'info'),
			title: String(payload.title || 'Notification'),
			message: String(payload.message || ''),
			sourceType: payload.sourceType
				? String(payload.sourceType)
				: undefined,
			sourceId: payload.sourceId ? String(payload.sourceId) : undefined,
		},
	})
}

const markRead = async (id: string) => {
	return prisma.notification.update({ where: { id }, data: { read: true } })
}

export const NotificationsService = {
	getNotifications,
	createNotification,
	markRead,
}
