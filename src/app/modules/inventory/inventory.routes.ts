import { Router } from 'express'

import { requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'

import { InventoryController } from './inventory.controller'

const router = Router()

// All inventory routes require manager+
router.get(
	'/',
	requireAuth,
	requireRole('manager'),
	InventoryController.getInventoryItems,
)
router.post(
	'/',
	requireAuth,
	requireRole('manager'),
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
	InventoryController.updateInventoryItem,
)
router.delete(
	'/:id',
	requireAuth,
	requireRole('manager'),
	InventoryController.deleteInventoryItem,
)

export const InventoryRoutes = router
