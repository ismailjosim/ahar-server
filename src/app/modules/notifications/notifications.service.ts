import { Prisma } from '@generated/prisma/client';

import { prisma } from '@/config/prisma.config';
import { calculatePagination } from '@/utils/paginationHelper';

type NotificationPayload = Record<string, unknown>;

const getNotifications = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = calculatePagination({
    page: Number(query.page || 1),
    limit: Number(query.limit || query.pageSize || 20),
  });

  const where: Prisma.NotificationWhereInput = {};
  if (query.read !== undefined) {
    where.read = query.read === 'true' || query.read === true;
  }
  if (query.type) {
    where.type = String(query.type);
  }

  const [data, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { read: false } }),
  ]);
  return { data, total, unreadCount, page, limit };
};

const createNotification = async (payload: NotificationPayload) => {
  return prisma.notification.create({
    data: {
      type: String(payload.type || 'info'),
      severity: String(payload.severity || payload.type || 'info'),
      title: String(payload.title || 'Notification'),
      message: String(payload.message || ''),
      sourceType: payload.sourceType ? String(payload.sourceType) : undefined,
      sourceId: payload.sourceId ? String(payload.sourceId) : undefined,
    },
  });
};

const markRead = async (id: string) => {
  return prisma.notification.update({ where: { id }, data: { read: true } });
};

const markAllRead = async () => {
  return prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
};

export const NotificationsService = {
  getNotifications,
  createNotification,
  markRead,
  markAllRead,
};
