import catchAsync from '@/shared/catchAsync';
import sendResponse from '@/shared/sendResponse';
import StatusCode from '@/utils/statusCode';

import { ReviewService } from './reviews.service';

const createReview = catchAsync(async (req, res) => {
  const userId = req.user?.id || null;
  const result = await ReviewService.createReview(userId, req.body);
  sendResponse(res, {
    statusCode: StatusCode.CREATED,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const getReviewsByMenuItem = catchAsync(async (req, res) => {
  const menuItemId = String(req.params.menuItemId);
  const result = await ReviewService.getReviewsByMenuItem(menuItemId);
  sendResponse(res, {
    statusCode: StatusCode.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const getAllReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getAllReviews(req.query);
  sendResponse(res, {
    statusCode: StatusCode.OK,
    success: true,
    message: 'All reviews retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateReviewStatus = catchAsync(async (req, res) => {
  const { isApproved } = req.body;
  const result = await ReviewService.updateReviewStatus(String(req.params.id), isApproved);
  sendResponse(res, {
    statusCode: StatusCode.OK,
    success: true,
    message: `Review ${isApproved ? 'approved' : 'hidden'} successfully`,
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  await ReviewService.deleteReview(String(req.params.id));
  sendResponse(res, {
    statusCode: StatusCode.OK,
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getReviewsByMenuItem,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
};
