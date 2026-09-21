import { UserRole } from '@generated/prisma/enums';
import { Router } from 'express';

import { checkAuth } from '@/middlewares/checkAuth';
import validateRequest from '@/middlewares/validateRequest';

import { ReviewController } from './reviews.controller';
import { ReviewValidation } from './reviews.validation';

const router = Router();

// Public: view approved reviews for a specific menu item
router.get('/menu/:menuItemId', ReviewController.getReviewsByMenuItem);

// Customer: submit a review
router.post(
  '/',
  checkAuth(),
  validateRequest(ReviewValidation.createReview),
  ReviewController.createReview,
);

// Admin / Manager routes
router.get(
  '/',
  checkAuth(UserRole.CASHIER, UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  validateRequest(ReviewValidation.getReviews),
  ReviewController.getAllReviews,
);

router.patch(
  '/:id/status',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  validateRequest(ReviewValidation.updateReviewStatus),
  ReviewController.updateReviewStatus,
);

router.delete(
  '/:id',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
