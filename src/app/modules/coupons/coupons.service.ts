import type { CouponWhereInput } from '@generated/prisma/models/Coupon';

import { prisma } from '@/config/prisma.config';
import AppError from '@/helpers/AppError';
import { calculatePagination } from '@/utils/paginationHelper';
import StatusCode from '@/utils/statusCode';

interface CreateCouponPayload {
  code: string;
  description?: string;
  discountType: 'flat' | 'percent';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}

interface UpdateCouponPayload {
  code?: string;
  description?: string | null;
  discountType?: 'flat' | 'percent';
  discountValue?: number;
  minOrderValue?: number;
  maxUses?: number | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}

const createCoupon = async (payload: CreateCouponPayload) => {
  const existing = await prisma.coupon.findUnique({
    where: { code: payload.code },
  });

  if (existing) {
    throw new AppError(StatusCode.CONFLICT, 'Coupon code already exists');
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: payload.code,
      description: payload.description,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      minOrderValue: payload.minOrderValue ?? 0,
      maxUses: payload.maxUses ?? null,
      expiresAt: payload.expiresAt ?? null,
      isActive: payload.isActive ?? true,
    },
  });

  return coupon;
};

const getCoupons = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = calculatePagination({
    page: Number(query.page || 1),
    limit: Number(query.limit || 20),
  });

  const andConditions: CouponWhereInput[] = [];

  if (query.search) {
    const search = String(query.search).trim();
    andConditions.push({
      OR: [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (query.isActive !== undefined) {
    andConditions.push({
      isActive: query.isActive === 'true',
    });
  }

  const whereCondition: CouponWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.coupon.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: coupons,
  };
};

const getCouponById = async (id: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    throw new AppError(StatusCode.NOT_FOUND, 'Coupon not found');
  }

  return coupon;
};

const updateCoupon = async (id: string, payload: UpdateCouponPayload) => {
  const existing = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(StatusCode.NOT_FOUND, 'Coupon not found');
  }

  if (payload.code && payload.code !== existing.code) {
    const duplicate = await prisma.coupon.findUnique({
      where: { code: payload.code },
    });
    if (duplicate) {
      throw new AppError(StatusCode.CONFLICT, 'Another coupon with this code already exists');
    }
  }

  const updated = await prisma.coupon.update({
    where: { id },
    data: payload,
  });

  return updated;
};

const deleteCoupon = async (id: string) => {
  const existing = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(StatusCode.NOT_FOUND, 'Coupon not found');
  }

  await prisma.coupon.delete({
    where: { id },
  });

  return null;
};

const validateCoupon = async (code: string, rawOrderAmount?: number) => {
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: code.trim().toUpperCase(),
      isActive: true,
    },
  });

  if (!coupon) {
    throw new AppError(StatusCode.NOT_FOUND, 'Coupon is invalid or inactive');
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError(StatusCode.BAD_REQUEST, 'This coupon has expired');
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new AppError(StatusCode.BAD_REQUEST, 'This coupon usage limit has been reached');
  }

  const orderAmount =
    rawOrderAmount !== undefined && !Number.isNaN(rawOrderAmount) ? rawOrderAmount : 0;

  if (coupon.minOrderValue > 0 && orderAmount < coupon.minOrderValue) {
    throw new AppError(
      StatusCode.BAD_REQUEST,
      `Minimum order value for this coupon is ৳${coupon.minOrderValue}`,
    );
  }

  let discountAmount =
    coupon.discountType === 'percent'
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;

  if (discountAmount > orderAmount && orderAmount > 0) {
    discountAmount = orderAmount;
  }

  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minOrderValue: coupon.minOrderValue,
    discountAmount: Math.round(discountAmount * 100) / 100,
    applicableAmount: orderAmount,
  };
};

export const CouponService = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
