import { z } from 'zod';

const createReview = z.object({
  body: z.object({
    menuItemId: z.string().min(1, 'Menu item ID is required'),
    orderId: z.string().optional(),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional(),
  }),
});

const updateReviewStatus = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    isApproved: z.boolean(),
  }),
});

const getReviews = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    menuItemId: z.string().optional(),
    isApproved: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
  }),
});

export const ReviewValidation = {
  createReview,
  updateReviewStatus,
  getReviews,
};
