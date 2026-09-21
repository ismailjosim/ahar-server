import type { ReviewWhereInput } from '@generated/prisma/models/Review';

import { prisma } from '@/config/prisma.config';
import AppError from '@/helpers/AppError';
import { calculatePagination } from '@/utils/paginationHelper';
import StatusCode from '@/utils/statusCode';

interface CreateReviewPayload {
  menuItemId: string;
  orderId?: string;
  rating: number;
  comment?: string;
}

const createReview = async (userId: string | null, payload: CreateReviewPayload) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: payload.menuItemId },
  });

  if (!menuItem) {
    throw new AppError(StatusCode.NOT_FOUND, 'Menu item not found');
  }

  // Create review - approved by default, subject to moderation
  const review = await prisma.review.create({
    data: {
      userId: userId || null,
      menuItemId: payload.menuItemId,
      orderId: payload.orderId || null,
      rating: payload.rating,
      comment: payload.comment || null,
      isApproved: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      menuItem: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  return review;
};

const getReviewsByMenuItem = async (menuItemId: string) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    select: { id: true, name: true },
  });

  if (!menuItem) {
    throw new AppError(StatusCode.NOT_FOUND, 'Menu item not found');
  }

  const reviews = await prisma.review.findMany({
    where: {
      menuItemId,
      isApproved: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalReviews = reviews.length;
  const ratingSum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    }
  });

  return {
    menuItem,
    stats: {
      totalReviews,
      averageRating,
      distribution,
    },
    reviews,
  };
};

const getAllReviews = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = calculatePagination({
    page: Number(query.page || 1),
    limit: Number(query.limit || 20),
  });

  const andConditions: ReviewWhereInput[] = [];

  if (query.menuItemId) {
    andConditions.push({ menuItemId: String(query.menuItemId) });
  }

  if (query.isApproved !== undefined) {
    andConditions.push({ isApproved: query.isApproved === 'true' });
  }

  if (query.search) {
    const search = String(query.search).trim();
    andConditions.push({
      OR: [
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { menuItem: { name: { contains: search, mode: 'insensitive' } } },
      ],
    });
  }

  const whereCondition: ReviewWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        menuItem: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: reviews,
  };
};

const updateReviewStatus = async (id: string, isApproved: boolean) => {
  const existing = await prisma.review.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(StatusCode.NOT_FOUND, 'Review not found');
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { isApproved },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      menuItem: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updated;
};

const deleteReview = async (id: string) => {
  const existing = await prisma.review.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(StatusCode.NOT_FOUND, 'Review not found');
  }

  await prisma.review.delete({
    where: { id },
  });

  return null;
};

export const ReviewService = {
  createReview,
  getReviewsByMenuItem,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
};
