import { Router } from 'express'

import { requireAuth } from '@/middlewares/requireAuth'
import { requireRole } from '@/middlewares/requireRole'
import validateRequest from '@/middlewares/validateRequest'

import { MenuController } from './menu.controller'
import { MenuValidation } from './menu.validation'

const router = Router()

// Public — anyone can browse the menu
router.get('/', MenuController.getMenuItems)
router.get('/:id', MenuController.getMenuItemById)

// Protected — manager+ to create / edit, owner+ to delete
router.post(
	'/',
	requireAuth,
	requireRole('manager'),
	validateRequest(MenuValidation.createMenuItem),
	MenuController.createMenuItem,
)
router.patch(
	'/:id',
	requireAuth,
	requireRole('manager'),
	validateRequest(MenuValidation.updateMenuItem),
	MenuController.updateMenuItem,
)
router.delete(
	'/:id',
	requireAuth,
	requireRole('owner'),
	MenuController.deleteMenuItem,
)

export const MenuRoutes = router
