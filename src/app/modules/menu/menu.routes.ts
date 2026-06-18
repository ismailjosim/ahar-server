import { Router } from 'express'

import validateRequest from '@/middlewares/validateRequest'
import { MenuController } from './menu.controller'
import { MenuValidation } from './menu.validation'

const router = Router()

router.post('/', validateRequest(MenuValidation.createMenuItem), MenuController.createMenuItem)
router.get('/', MenuController.getMenuItems)
router.get('/:id', MenuController.getMenuItemById)
router.patch('/:id', validateRequest(MenuValidation.updateMenuItem), MenuController.updateMenuItem)
router.delete('/:id', MenuController.deleteMenuItem)

export const MenuRoutes = router
