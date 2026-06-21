import { Router } from 'express'

import { optionalAuth, requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'

import { ReservationsController } from './reservations.controller'

const router = Router()

// Public — customers book tables (optionalAuth links to account when logged in)
router.post('/', optionalAuth, ReservationsController.createReservation)

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
