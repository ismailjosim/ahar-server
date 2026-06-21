import { Router } from 'express'

import { optionalAuth, requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'
import validateRequest from '@/middlewares/validateRequest'

import { OrdersController } from './orders.controller'
import { OrdersValidation } from './orders.validation'

const router = Router()

// Public — customers place orders (optionalAuth links order to account if logged in)
router.post(
	'/',
	optionalAuth,
	validateRequest(OrdersValidation.createOrder),
	OrdersController.createOrder,
)

// Public — order tracking by ID (customer looks up their own order)
router.get('/:id', OrdersController.getOrderById)

// Protected — cashier+ views all orders
router.get('/', requireAuth, requireRole('cashier'), OrdersController.getOrders)

// Protected — cashier+ updates order status
router.patch(
	'/:id',
	requireAuth,
	requireRole('cashier'),
	validateRequest(OrdersValidation.updateOrderStatus),
	OrdersController.updateOrderStatus,
)

export const OrdersRoutes = router
