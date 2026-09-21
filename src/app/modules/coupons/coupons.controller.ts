import catchAsync from '@/shared/catchAsync';
import sendResponse from '@/shared/sendResponse';
import StatusCode from '@/utils/statusCode';

import { CouponService } from './coupons.service';

const createCoupon = catchAsync(async (req, res) => {
  const result = await CouponService.createCoupon(req.body);
  sendResponse(res, {
    statusCode: StatusCode.CREATED,
    success: true,
    message: 'Coupon created successfully',
    data: result,
  });
});

const getCoupons = catchAsync(async (req, res) => {
  const result = await CouponService.getCoupons(req.query);
  sendResponse(res, {
    statusCode: StatusCode.OK,
    success: true,
    message: 'Coupons retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getCouponById = catchAsync(async (req, res) => {
  const result = await CouponService.getCouponById(String(req.params.id));
  sendResponse(res, {
    statusCode: StatusCode.OK,
    success: true,
    message: 'Coupon retrieved successfully',
    data: result,
  });
});

const updateCoupon = catchAsync(async (req, res) => {
  const result = await CouponService.updateCoupon(String(req.params.id), req.body);
  sendResponse(res, {
    statusCode: StatusCode.OK,
    success: true,
    message: 'Coupon updated successfully',
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req, res) => {
  await CouponService.deleteCoupon(String(req.params.id));
  sendResponse(res, {
    statusCode: StatusCode.OK,
    success: true,
    message: 'Coupon deleted successfully',
    data: null,
  });
});

const validateCoupon = catchAsync(async (req, res) => {
  const code = String(req.params.code);
  const orderAmount = req.query.orderAmount ? Number(req.query.orderAmount) : undefined;
  const result = await CouponService.validateCoupon(code, orderAmount);
  sendResponse(res, {
    statusCode: StatusCode.OK,
    success: true,
    message: 'Coupon is valid',
    data: result,
  });
});

export const CouponController = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
