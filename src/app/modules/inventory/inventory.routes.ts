import { Router } from 'express'

import { requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'
import validateRequest from '@/middlewares/validateRequest'

import { InventoryController } from './inventory.controller'
import { InventoryValidation } from './inventory.validation'

const router = Router()

// All inventory routes require manager+
router.get(
	'/',
	requireAuth,
	requireRole('manager'),
	validateRequest(InventoryValidation.getInventoryItems),
	InventoryController.getInventoryItems,
)
router.post(
	'/',
	requireAuth,
	requireRole('manager'),
	validateRequest(InventoryValidation.createInventoryItem),
	InventoryController.createInventoryItem,
)
router.get(
	'/:id',
	requireAuth,
	requireRole('manager'),
	InventoryController.getInventoryItemById,
)
router.patch(
	'/:id',
	requireAuth,
	requireRole('manager'),
	validateRequest(InventoryValidation.updateInventoryItem),
	InventoryController.updateInventoryItem,
)
router.delete(
	'/:id',
	requireAuth,
	requireRole('manager'),
	InventoryController.deleteInventoryItem,
)

export const InventoryRoutes = router
