import { Router } from 'express'

import { InventoryController } from './inventory.controller'

const router = Router()

router.get('/', InventoryController.getInventoryItems)
router.post('/', InventoryController.createInventoryItem)
router.get('/:id', InventoryController.getInventoryItemById)
router.patch('/:id', InventoryController.updateInventoryItem)
router.delete('/:id', InventoryController.deleteInventoryItem)

export const InventoryRoutes = router
