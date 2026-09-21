import { z } from 'zod';

const createCoupon = z.object({
  body: z.object({
    code: z
      .string()
      .min(1, 'Coupon code is required')
      .max(30, 'Coupon code must be under 30 characters')
      .trim()
      .transform((val) => val.toUpperCase()),
    description: z.string().max(255).optional(),
    discountType: z.enum(['flat', 'percent'], {
      error: 'Discount type must be flat or percent',
    }),
    discountValue: z.number().positive('Discount value must be greater than 0'),
    minOrderValue: z.number().min(0, 'Minimum order value cannot be negative').default(0),
    maxUses: z.number().int().positive().nullable().optional(),
    expiresAt: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .transform((val) => (val ? new Date(val) : null)),
    isActive: z.boolean().default(true),
  }),
});

const updateCoupon = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    code: z
      .string()
      .min(1)
      .max(30)
      .trim()
      .transform((val) => val.toUpperCase())
      .optional(),
    description: z.string().max(255).nullable().optional(),
    discountType: z.enum(['flat', 'percent']).optional(),
    discountValue: z.number().positive().optional(),
    minOrderValue: z.number().min(0).optional(),
    maxUses: z.number().int().positive().nullable().optional(),
    expiresAt: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .transform((val) => (val ? new Date(val) : null)),
    isActive: z.boolean().optional(),
  }),
});

const validateCoupon = z.object({
  params: z.object({
    code: z.string().min(1, 'Coupon code is required'),
  }),
  query: z.object({
    orderAmount: z.string().optional(),
  }),
});

const getCoupons = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

export const CouponValidation = {
  createCoupon,
  updateCoupon,
  validateCoupon,
  getCoupons,
};
