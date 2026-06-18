import { Router } from 'express'

import { OrdersController } from './orders.controller'

const router = Router()

router.get('/', OrdersController.getOrders)
router.post('/', OrdersController.createOrder)
router.get('/:id', OrdersController.getOrderById)
router.patch('/:id', OrdersController.updateOrderStatus)

export const OrdersRoutes = router
