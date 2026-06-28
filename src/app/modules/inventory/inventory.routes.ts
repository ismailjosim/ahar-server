import { Router } from 'express'

import { requireRole } from '@/middlewares/requireRole'
import validateRequest from '@/middlewares/validateRequest'

import { InventoryController } from './inventory.controller'
import { InventoryValidation } from './inventory.validation'

const router = Router()

// All inventory routes require manager+
router.get(
	'/',
	validateRequest(InventoryValidation.getInventoryItems),
	InventoryController.getInventoryItems,
)
router.post(
	'/',
	validateRequest(InventoryValidation.createInventoryItem),
	InventoryController.createInventoryItem,
)
router.get('/:id', InventoryController.getInventoryItemById)
router.patch(
	'/:id',
	validateRequest(InventoryValidation.updateInventoryItem),
	InventoryController.updateInventoryItem,
)
router.delete('/:id', InventoryController.deleteInventoryItem)

export const InventoryRoutes = router
