import { Router } from 'express'

import { ReservationsController } from './reservations.controller'

const router = Router()

router.get('/', ReservationsController.getReservations)
router.post('/', ReservationsController.createReservation)
router.get('/:id', ReservationsController.getReservationById)
router.patch('/:id', ReservationsController.updateReservation)
router.delete('/:id', ReservationsController.deleteReservation)

export const ReservationsRoutes = router
