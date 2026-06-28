import { Router } from 'express'
import validateRequest from '@/middlewares/validateRequest'

import { PaymentsController } from './payments.controller'
import { PaymentsValidation } from './payments.validation'

const router = Router()

// cashier+ can read all payments
router.get(
	'/',
	PaymentsController.getPayments,
)
router.get(
	'/:id',
	PaymentsController.getPaymentById,
)

// cashier+ can create payment records (triggered by order flow)
router.post(
	'/',
	validateRequest(PaymentsValidation.createPayment),
	PaymentsController.createPayment,
)

// owner+ can update payment status (refunds, manual corrections)
router.patch(
	'/:id',
	validateRequest(PaymentsValidation.updatePayment),
	PaymentsController.updatePayment,
)

// Authenticated user initiates payment
router.post('/sslcommerz/init', PaymentsController.initSSLCommerz)

// IPN from SSLCOMMERZ (no auth — SSLCOMMERZ server calls this directly)
router.post('/sslcommerz/ipn', PaymentsController.handleSSLCommerzIPN)

export const PaymentsRoutes = router
