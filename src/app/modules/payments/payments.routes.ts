import { Router } from 'express'

import { requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'
import validateRequest from '@/middlewares/validateRequest'

import { PaymentsController } from './payments.controller'
import { PaymentsValidation } from './payments.validation'

const router = Router()

// cashier+ can read all payments
router.get(
	'/',
	requireAuth,
	requireRole('cashier'),
	PaymentsController.getPayments,
)
router.get(
	'/:id',
	requireAuth,
	requireRole('cashier'),
	PaymentsController.getPaymentById,
)

// cashier+ can create payment records (triggered by order flow)
router.post(
	'/',
	requireAuth,
	requireRole('cashier'),
	validateRequest(PaymentsValidation.createPayment),
	PaymentsController.createPayment,
)

// owner+ can update payment status (refunds, manual corrections)
router.patch(
	'/:id',
	requireAuth,
	requireRole('owner'),
	validateRequest(PaymentsValidation.updatePayment),
	PaymentsController.updatePayment,
)

export const PaymentsRoutes = router
