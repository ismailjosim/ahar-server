import { Router } from 'express'

import { optionalAuth, requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'
import validateRequest from '@/middlewares/validateRequest'

import { ReservationsController } from './reservations.controller'
import { ReservationsValidation } from './reservations.validation'

const router = Router()

// Public — customers book tables (optionalAuth links to account when logged in)
router.post(
	'/',
	optionalAuth,
	validateRequest(ReservationsValidation.createReservation),
	ReservationsController.createReservation,
)

// Protected — authenticated customer views their own reservations
router.get('/my', requireAuth, ReservationsController.getMyReservations)

// Protected — authenticated customer cancels their own reservation
router.patch(
	'/my/:id/cancel',
	requireAuth,
	ReservationsController.cancelMyReservation,
)

// Public — customers look up their own reservation by ID
router.get('/:id', ReservationsController.getReservationById)

// Protected — manager+ views all reservations
router.get(
	'/',
	requireAuth,
	requireRole('manager'),
	ReservationsController.getReservations,
)

// Protected — manager+ approves / rejects / edits
router.patch(
	'/:id',
	requireAuth,
	requireRole('manager'),
	validateRequest(ReservationsValidation.updateReservation),
	ReservationsController.updateReservation,
)

// Protected — manager+ deletes reservation
router.delete(
	'/:id',
	requireAuth,
	requireRole('manager'),
	ReservationsController.deleteReservation,
)

export const ReservationsRoutes = router
