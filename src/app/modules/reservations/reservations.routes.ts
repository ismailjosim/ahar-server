import { UserRole } from '@generated/prisma/enums';
import { Router } from 'express';

import { checkAuth, optionalAuth } from '@/middlewares/checkAuth';
import validateRequest from '@/middlewares/validateRequest';

import { ReservationsController } from './reservations.controller';
import { ReservationsValidation } from './reservations.validation';

const router = Router();

// Public — customers book tables (optionalAuth links to account when logged in)
router.post(
  '/',
  optionalAuth,
  validateRequest(ReservationsValidation.createReservation),
  ReservationsController.createReservation,
);

// Protected — authenticated customer views their own reservations
router.get('/my', checkAuth(), ReservationsController.getMyReservations);

// Protected — authenticated customer cancels their own reservation
router.patch('/my/:id/cancel', checkAuth(), ReservationsController.cancelMyReservation);

// Public — customers look up their own reservation by ID
router.get('/:id', ReservationsController.getReservationById);

// Protected — manager+ views all reservations
router.get(
  '/',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  ReservationsController.getReservations,
);

// Protected — manager+ approves / rejects / edits
router.patch(
  '/:id',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  validateRequest(ReservationsValidation.updateReservation),
  ReservationsController.updateReservation,
);

// Protected — manager+ deletes reservation
router.delete(
  '/:id',
  checkAuth(UserRole.MANAGER, UserRole.OWNER, UserRole.SUPER_ADMIN),
  ReservationsController.deleteReservation,
);

export const ReservationsRoutes = router;
