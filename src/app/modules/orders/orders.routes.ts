import { Router } from 'express'

import { optionalAuth, requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'

import { OrdersController } from './orders.controller'

const router = Router()

// Public — customers place orders (optionalAuth links order to account if logged in)
router.post('/', optionalAuth, OrdersController.createOrder)

// Public — order tracking by ID (customer looks up their own order)
router.get('/:id', OrdersController.getOrderById)

// Protected — cashier+ views all orders
router.get('/', requireAuth, requireRole('cashier'), OrdersController.getOrders)

// Protected — cashier+ updates order status
router.patch(
	'/:id',
	requireAuth,
	requireRole('cashier'),
	OrdersController.updateOrderStatus,
)

export const OrdersRoutes = router
