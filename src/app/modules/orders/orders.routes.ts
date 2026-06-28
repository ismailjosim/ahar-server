import { Router } from 'express'

import validateRequest from '@/middlewares/validateRequest'

import { OrdersController } from './orders.controller'
import { OrdersValidation } from './orders.validation'

const router = Router()

// Public — customers place orders (optionalAuth links order to account if logged in)
router.post(
	'/',
	validateRequest(OrdersValidation.createOrder),
	OrdersController.createOrder,
)

// Protected — authenticated customer views their own orders
router.get('/my', OrdersController.getMyOrders)

// Public — order tracking by ID (customer looks up their own order)
router.get('/:id', OrdersController.getOrderById)

// Protected — cashier+ views all orders
router.get('/', OrdersController.getOrders)

// Protected — cashier+ updates order status
router.patch(
	'/:id',
	validateRequest(OrdersValidation.updateOrderStatus),
	OrdersController.updateOrderStatus,
)

export const OrdersRoutes = router
