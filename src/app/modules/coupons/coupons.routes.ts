import { UserRole } from '@generated/prisma/enums';
import { Router } from 'express';

import { checkAuth } from '@/middlewares/checkAuth';
import validateRequest from '@/middlewares/validateRequest';

import { CouponController } from './coupons.controller';
import { CouponValidation } from './coupons.validation';

const router = Router();

// Public validation endpoint
router.get(
  '/validate/:code',
  validateRequest(CouponValidation.validateCoupon),
  CouponController.validateCoupon,
);

// Admin / Manager routes
router.get(
  '/',
  checkAuth(UserRole.CASHIER, UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  validateRequest(CouponValidation.getCoupons),
  CouponController.getCoupons,
);

router.post(
  '/',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  validateRequest(CouponValidation.createCoupon),
  CouponController.createCoupon,
);

router.get(
  '/:id',
  checkAuth(UserRole.CASHIER, UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  CouponController.getCouponById,
);

router.patch(
  '/:id',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  validateRequest(CouponValidation.updateCoupon),
  CouponController.updateCoupon,
);

router.delete(
  '/:id',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  CouponController.deleteCoupon,
);

export const CouponRoutes = router;
