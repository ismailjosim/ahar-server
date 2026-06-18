import { Router } from 'express'

import { PaymentsController } from './payments.controller'

const router = Router()

router.get('/', PaymentsController.getPayments)
router.post('/', PaymentsController.createPayment)
router.get('/:id', PaymentsController.getPaymentById)
router.patch('/:id', PaymentsController.updatePayment)

export const PaymentsRoutes = router
