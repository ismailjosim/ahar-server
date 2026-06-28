import { Router } from 'express'
import validateRequest from '@/middlewares/validateRequest'

import { ReservationsController } from './reservations.controller'
import { ReservationsValidation } from './reservations.validation'

const router = Router()

// Public — customers book tables (optionalAuth links to account when logged in)
router.post(
	'/',
	validateRequest(ReservationsValidation.createReservation),
	ReservationsController.createReservation,
)

// Protected — authenticated customer views their own reservations
router.get('/my', ReservationsController.getMyReservations)

// Protected — authenticated customer cancels their own reservation
router.patch(
	'/my/:id/cancel',

	ReservationsController.cancelMyReservation,
)

// Public — customers look up their own reservation by ID
router.get('/:id', ReservationsController.getReservationById)

// Protected — manager+ views all reservations
router.get('/', ReservationsController.getReservations)

// Protected — manager+ approves / rejects / edits
router.patch(
	'/:id',
	validateRequest(ReservationsValidation.updateReservation),
	ReservationsController.updateReservation,
)

// Protected — manager+ deletes reservation
router.delete('/:id', ReservationsController.deleteReservation)

export const ReservationsRoutes = router
